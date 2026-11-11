from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.database import get_db
from app.models.models import Merchant, User, Review
from app.api.endpoints.bookings import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter()

class UpdateMerchantPhotoRequest(BaseModel):
    image_url: str

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
