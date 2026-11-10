from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.models import Merchant
from typing import List

router = APIRouter()

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
