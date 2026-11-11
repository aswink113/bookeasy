from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update, delete
from app.database import get_db
from app.models.models import User, Merchant, Booking, SubscriptionPayment, Review, MasterCategory, MasterSubCategory
import uuid
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter()

# Pydantic Schemas for Master Data Management
class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "✨"
    description: Optional[str] = ""
    is_active: Optional[bool] = True
    display_order: Optional[int] = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

class SubCategoryCreate(BaseModel):
    category_id: str
    name: str
    default_price: Optional[float] = 0.0
    duration_mins: Optional[int] = 30
    is_active: Optional[bool] = True

class SubCategoryUpdate(BaseModel):
    name: Optional[str] = None
    default_price: Optional[float] = None
    duration_mins: Optional[int] = None
    is_active: Optional[bool] = None

# --- ADMIN OVERVIEW & STATS ---
@router.get("/overview")
async def get_admin_overview(db: AsyncSession = Depends(get_db)):
    try:
        users_count = await db.scalar(select(func.count(User.id))) or 0
        merchants_count = await db.scalar(select(func.count(Merchant.id))) or 0
        bookings_count = await db.scalar(select(func.count(Booking.id))) or 0
        subscribed_count = await db.scalar(select(func.count(Merchant.id)).where(Merchant.is_subscribed == True)) or 0
        
        # Calculate actual revenue from subscription_payments
        revenue_sum = await db.scalar(select(func.sum(SubscriptionPayment.amount)).where(SubscriptionPayment.status == 'verified')) or (subscribed_count * 299)

        top_merchants_res = await db.execute(select(Merchant).order_by(desc(Merchant.rating)).limit(5))
        top_merchants = [
            {
                "id": str(m.id),
                "shop_name": m.shop_name,
                "service_type": m.service_type,
                "rating": m.rating,
                "is_subscribed": m.is_subscribed,
                "address": m.address
            }
            for m in top_merchants_res.scalars().all()
        ]

        recent_bookings_res = await db.execute(
            select(Booking, User.name, Merchant.shop_name, Merchant.service_type, Merchant.base_price)
            .join(User, Booking.customer_id == User.id)
            .join(Merchant, Booking.merchant_id == Merchant.id)
            .order_by(desc(Booking.created_at))
            .limit(6)
        )
        recent_bookings = [
            {
                "id": str(row[0].id),
                "customer_name": row[1],
                "shop_name": row[2],
                "service": row[3],
                "price": float(row[4] or 0),
                "status": row[0].status,
                "booking_date": row[0].booking_date.isoformat() if row[0].booking_date else "",
                "created_at": row[0].created_at.isoformat() if row[0].created_at else ""
            }
            for row in recent_bookings_res.all()
        ]

        return {
            "stats": {
                "users": users_count,
                "merchants": merchants_count,
                "bookings": bookings_count,
                "revenue": float(revenue_sum)
            },
            "top_merchants": top_merchants,
            "recent_bookings": recent_bookings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- FLEET MANAGEMENT (MERCHANTS) ---
@router.get("/merchants")
async def get_all_merchants(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Merchant, User.email).join(User, Merchant.id == User.id).order_by(Merchant.shop_name))
    merchants = []
    for m, email in res.all():
        # count total bookings for this merchant
        b_count = await db.scalar(select(func.count(Booking.id)).where(Booking.merchant_id == m.id)) or 0
        merchants.append({
            "id": str(m.id),
            "shop_name": m.shop_name,
            "email": email,
            "address": m.address,
            "service_type": m.service_type,
            "base_price": float(m.base_price or 0),
            "rating": m.rating,
            "is_subscribed": m.is_subscribed,
            "total_bookings": b_count,
            "sub_services_count": len(m.sub_services or [])
        })
    return merchants

@router.patch("/merchants/{merchant_id}/toggle-subscription")
async def toggle_merchant_subscription(merchant_id: str, db: AsyncSession = Depends(get_db)):
    try:
        mid = uuid.UUID(merchant_id)
        m = await db.get(Merchant, mid)
        if not m:
            raise HTTPException(status_code=404, detail="Merchant not found")
        m.is_subscribed = not m.is_subscribed
        await db.commit()
        return {"status": "success", "is_subscribed": m.is_subscribed}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- USERS / CUSTOMER BASE ---
@router.get("/users")
async def get_all_users(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).order_by(desc(User.email)))
    users = []
    for u in res.scalars().all():
        b_count = 0
        if u.role == 'customer':
            b_count = await db.scalar(select(func.count(Booking.id)).where(Booking.customer_id == u.id)) or 0
        users.append({
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "total_bookings": b_count
        })
    return users

# --- BOOKING LEDGER ---
@router.get("/bookings")
async def get_all_bookings(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Booking, User.name, User.email, Merchant.shop_name, Merchant.service_type, Merchant.base_price)
        .join(User, Booking.customer_id == User.id)
        .join(Merchant, Booking.merchant_id == Merchant.id)
        .order_by(desc(Booking.created_at))
    )
    bookings = []
    for b, c_name, c_email, s_name, s_type, price in res.all():
        bookings.append({
            "id": str(b.id),
            "customer_name": c_name,
            "customer_email": c_email,
            "shop_name": s_name,
            "service_type": s_type,
            "price": float(price or 0),
            "status": b.status,
            "has_reviewed": b.has_reviewed,
            "booking_date": b.booking_date.isoformat() if b.booking_date else "",
            "created_at": b.created_at.isoformat() if b.created_at else ""
        })
    return bookings

# --- MASTER DATA: CATEGORIES CRUD ---
@router.get("/categories")
async def get_master_categories(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(MasterCategory).order_by(MasterCategory.display_order, MasterCategory.name))
    categories = []
    for cat in res.scalars().all():
        categories.append({
            "id": str(cat.id),
            "name": cat.name,
            "icon": cat.icon,
            "description": cat.description or "",
            "is_active": cat.is_active,
            "display_order": cat.display_order,
            "sub_categories": [
                {
                    "id": str(sub.id),
                    "category_id": str(sub.category_id),
                    "name": sub.name,
                    "default_price": float(sub.default_price or 0),
                    "duration_mins": sub.duration_mins,
                    "is_active": sub.is_active
                }
                for sub in cat.sub_categories
            ]
        })
    return categories

@router.post("/categories")
async def create_master_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    # Check if category name exists
    existing = await db.scalar(select(MasterCategory).where(func.lower(MasterCategory.name) == data.name.strip().lower()))
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    new_cat = MasterCategory(
        id=uuid.uuid4(),
        name=data.name.strip(),
        icon=data.icon.strip() if data.icon else "✨",
        description=data.description or "",
        is_active=data.is_active,
        display_order=data.display_order or 0
    )
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)
    return {
        "id": str(new_cat.id),
        "name": new_cat.name,
        "icon": new_cat.icon,
        "description": new_cat.description,
        "is_active": new_cat.is_active,
        "display_order": new_cat.display_order,
        "sub_categories": []
    }

@router.put("/categories/{category_id}")
async def update_master_category(category_id: str, data: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    cid = uuid.UUID(category_id)
    cat = await db.get(MasterCategory, cid)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if data.name is not None:
        cat.name = data.name.strip()
    if data.icon is not None:
        cat.icon = data.icon.strip()
    if data.description is not None:
        cat.description = data.description
    if data.is_active is not None:
        cat.is_active = data.is_active
    if data.display_order is not None:
        cat.display_order = data.display_order
        
    await db.commit()
    await db.refresh(cat)
    return {
        "id": str(cat.id),
        "name": cat.name,
        "icon": cat.icon,
        "description": cat.description,
        "is_active": cat.is_active,
        "display_order": cat.display_order
    }

@router.delete("/categories/{category_id}")
async def delete_master_category(category_id: str, db: AsyncSession = Depends(get_db)):
    cid = uuid.UUID(category_id)
    cat = await db.get(MasterCategory, cid)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(cat)
    await db.commit()
    return {"status": "success", "message": "Category deleted successfully"}

# --- MASTER DATA: SUB-CATEGORIES CRUD ---
@router.post("/sub-categories")
async def create_master_sub_category(data: SubCategoryCreate, db: AsyncSession = Depends(get_db)):
    cid = uuid.UUID(data.category_id)
    cat = await db.get(MasterCategory, cid)
    if not cat:
        raise HTTPException(status_code=404, detail="Parent category not found")

    new_sub = MasterSubCategory(
        id=uuid.uuid4(),
        category_id=cid,
        name=data.name.strip(),
        default_price=data.default_price or 0.0,
        duration_mins=data.duration_mins or 30,
        is_active=data.is_active
    )
    db.add(new_sub)
    await db.commit()
    await db.refresh(new_sub)
    return {
        "id": str(new_sub.id),
        "category_id": str(new_sub.category_id),
        "name": new_sub.name,
        "default_price": float(new_sub.default_price or 0),
        "duration_mins": new_sub.duration_mins,
        "is_active": new_sub.is_active
    }

@router.put("/sub-categories/{sub_id}")
async def update_master_sub_category(sub_id: str, data: SubCategoryUpdate, db: AsyncSession = Depends(get_db)):
    sid = uuid.UUID(sub_id)
    sub = await db.get(MasterSubCategory, sid)
    if not sub:
        raise HTTPException(status_code=404, detail="Sub-category not found")

    if data.name is not None:
        sub.name = data.name.strip()
    if data.default_price is not None:
        sub.default_price = data.default_price
    if data.duration_mins is not None:
        sub.duration_mins = data.duration_mins
    if data.is_active is not None:
        sub.is_active = data.is_active

    await db.commit()
    await db.refresh(sub)
    return {
        "id": str(sub.id),
        "category_id": str(sub.category_id),
        "name": sub.name,
        "default_price": float(sub.default_price or 0),
        "duration_mins": sub.duration_mins,
        "is_active": sub.is_active
    }

@router.delete("/sub-categories/{sub_id}")
async def delete_master_sub_category(sub_id: str, db: AsyncSession = Depends(get_db)):
    sid = uuid.UUID(sub_id)
    sub = await db.get(MasterSubCategory, sid)
    if not sub:
        raise HTTPException(status_code=404, detail="Sub-category not found")

    await db.delete(sub)
    await db.commit()
    return {"status": "success", "message": "Sub-category deleted successfully"}
