from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.database import get_db
from app.models.models import Merchant, User, Review, Booking
from app.api.endpoints.bookings import get_current_user
from pydantic import BaseModel
from typing import List, Optional, Any
import uuid

router = APIRouter()

class UpdateMerchantPhotoRequest(BaseModel):
    image_url: str

class UpdateMerchantProfileRequest(BaseModel):
    shop_name: Optional[str] = None
    service_type: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    about: Optional[str] = None
    base_price: Optional[float] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    is_open_now: Optional[bool] = None

class SubServiceItem(BaseModel):
    id: Optional[str] = None
    name: str
    price: float
    duration: Optional[str] = "30 mins"
    photo: Optional[str] = None
    description: Optional[str] = ""

class UpdateSubServicesRequest(BaseModel):
    sub_services: List[SubServiceItem]

class UpdateGalleryRequest(BaseModel):
    gallery_photos: List[str]

@router.get("/me")
async def get_my_merchant_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full profile details for the authenticated merchant"""
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can view merchant profile")

    query = select(Merchant).where(Merchant.id == current_user.id)
    result = await db.execute(query)
    merchant = result.scalars().first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    return {
        "id": str(merchant.id),
        "shop_name": merchant.shop_name,
        "service_type": merchant.service_type,
        "address": merchant.address,
        "phone": merchant.phone or "",
        "about": merchant.about or "",
        "base_price": float(merchant.base_price or 0),
        "rating": float(merchant.rating or 5.0),
        "is_subscribed": merchant.is_subscribed,
        "subscription_end": merchant.subscription_end.isoformat() if merchant.subscription_end else None,
        "image_url": merchant.image_url,
        "gallery_photos": merchant.gallery_photos or [],
        "sub_services": merchant.sub_services or [],
        "opening_time": merchant.opening_time or "09:00",
        "closing_time": merchant.closing_time or "20:00",
        "is_open_now": merchant.is_open_now if merchant.is_open_now is not None else True,
    }

@router.put("/profile")
async def update_merchant_profile(
    payload: UpdateMerchantProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update general business profile details"""
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can update merchant profile")

    query = select(Merchant).where(Merchant.id == current_user.id)
    result = await db.execute(query)
    merchant = result.scalars().first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    if payload.shop_name is not None:
        merchant.shop_name = payload.shop_name.strip()
    if payload.service_type is not None:
        merchant.service_type = payload.service_type.strip()
    if payload.address is not None:
        merchant.address = payload.address.strip()
    if payload.phone is not None:
        merchant.phone = payload.phone.strip()
    if payload.about is not None:
        merchant.about = payload.about.strip()
    if payload.base_price is not None:
        merchant.base_price = payload.base_price
    if payload.opening_time is not None:
        merchant.opening_time = payload.opening_time.strip()
    if payload.closing_time is not None:
        merchant.closing_time = payload.closing_time.strip()
    if payload.is_open_now is not None:
        merchant.is_open_now = payload.is_open_now

    await db.commit()
    await db.refresh(merchant)
    return {"status": "success", "message": "Merchant profile updated successfully"}

@router.put("/photo")
async def update_merchant_photo(
    payload: UpdateMerchantPhotoRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current merchant's cover photo/image_url"""
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can update cover photo")
    
    query = select(Merchant).where(Merchant.id == current_user.id)
    result = await db.execute(query)
    merchant = result.scalars().first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")
        
    merchant.image_url = payload.image_url
    await db.commit()
    await db.refresh(merchant)
    return {"status": "success", "image_url": merchant.image_url}

@router.put("/sub-services")
async def update_merchant_sub_services(
    payload: UpdateSubServicesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the merchant's list of sub-services & pricing"""
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can update sub-services")

    query = select(Merchant).where(Merchant.id == current_user.id)
    result = await db.execute(query)
    merchant = result.scalars().first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    services_list = []
    for s in payload.sub_services:
        services_list.append({
            "id": s.id or str(uuid.uuid4())[:8],
            "name": s.name.strip(),
            "price": float(s.price),
            "duration": s.duration or "30 mins",
            "photo": s.photo or merchant.image_url or "",
            "description": s.description or "",
        })

    merchant.sub_services = services_list
    await db.commit()
    await db.refresh(merchant)
    return {"status": "success", "sub_services": merchant.sub_services}

@router.put("/gallery")
async def update_merchant_gallery(
    payload: UpdateGalleryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the merchant's gallery photos"""
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can update gallery photos")

    query = select(Merchant).where(Merchant.id == current_user.id)
    result = await db.execute(query)
    merchant = result.scalars().first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    merchant.gallery_photos = payload.gallery_photos
    await db.commit()
    await db.refresh(merchant)
    return {"status": "success", "gallery_photos": merchant.gallery_photos}

@router.get("/discovery")
async def get_discovery_merchants(db: AsyncSession = Depends(get_db)):
    """
    Returns list of active merchants for the customer feed.
    """
    query = select(Merchant)
    result = await db.execute(query)
    merchants = result.scalars().all()
    return merchants

@router.get("/nearby")
async def get_nearby_merchants(
    lat: float = 12.9716, 
    lng: float = 77.5946, 
    radius: int = 5000, 
    db: AsyncSession = Depends(get_db)
):
    query = select(Merchant)
    result = await db.execute(query)
    merchants = result.scalars().all()
    return merchants

@router.get("/{merchant_id}/reviews")
async def get_merchant_reviews(merchant_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns verified customer reviews for a given merchant with customer names and ratings.
    """
    try:
        mid = uuid.UUID(merchant_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid merchant UUID")

    res = await db.execute(
        select(Review, User.name)
        .join(User, Review.customer_id == User.id)
        .where(Review.merchant_id == mid)
        .order_by(desc(Review.created_at))
    )
    
    reviews = []
    for r, customer_name in res.all():
        reviews.append({
            "id": str(r.id),
            "booking_id": str(r.booking_id),
            "customer_name": customer_name or "Verified Customer",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })

    return reviews
