from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.models import Merchant, User
from app.api.endpoints.bookings import get_current_user
from pydantic import BaseModel
from typing import List, Optional

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
