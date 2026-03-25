from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.models.models import Merchant
from app.schemas.schemas import MerchantDiscoveryResponse
from typing import List

router = APIRouter()

@router.get("/nearby", response_model=List[MerchantDiscoveryResponse])
async def get_nearby_merchants(
    lat: float, 
    lng: float, 
    radius: int = 5000, 
    db: AsyncSession = Depends(get_db)
):
    """
    Finds merchants within 'radius' meters using PostGIS proximity search.
    """
    # Create point geography
    point = f'SRID=4326;POINT({lng} {lat})'
    
    # Query using ST_DWithin and extract coordinates
    query = select(
        Merchant.id, 
        Merchant.shop_name, 
        Merchant.service_type, 
        Merchant.address, 
        Merchant.rating, 
        Merchant.base_price, 
        Merchant.is_subscribed, 
        Merchant.subscription_end,
        func.ST_Y(Merchant.location.cast(func.geometry)).label("lat"),
        func.ST_X(Merchant.location.cast(func.geometry)).label("lng")
    ).where(
        func.ST_DWithin(Merchant.location, point, radius)
    )
    
    result = await db.execute(query)
    merchants = result.mappings().all()
    
    return merchants
