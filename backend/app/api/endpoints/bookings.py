from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.models import Booking, User, Merchant
from app.schemas.schemas import BookingCreate, BookingResponse, BookingUpdate
from app.utils.fcm import send_push_notification
from typing import List
from uuid import UUID
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/", response_model=BookingResponse)
async def create_booking(booking_in: BookingCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Create booking request
    new_booking = Booking(
        customer_id=current_user.id,
        merchant_id=booking_in.merchant_id,
        booking_date=booking_in.booking_date,
        status="pending"
    )
    db.add(new_booking)
    await db.flush()
    
    # Notify Merchant
    query = select(User).where(User.id == booking_in.merchant_id)
    result = await db.execute(query)
    merchant_user = result.scalars().first()
    
    if merchant_user and merchant_user.fcm_token:
        await send_push_notification(
            fcm_token=merchant_user.fcm_token,
            title="New Booking Request",
            body=f"Request from {current_user.name} for {booking_in.booking_date}",
            data={"booking_id": str(new_booking.id)}
        )
    
    await db.commit()
    return new_booking

@router.get("/merchant", response_model=List[BookingResponse])
async def get_merchant_bookings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Forbidden")
    
    query = select(Booking).where(Booking.merchant_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(booking_id: UUID, status_update: BookingUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    query = select(Booking).where(Booking.id == booking_id, Booking.merchant_id == current_user.id)
    result = await db.execute(query)
    booking = result.scalars().first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = status_update.status
    await db.flush()
    
    # Notify Customer
    query = select(User).where(User.id == booking.customer_id)
    result = await db.execute(query)
    customer_user = result.scalars().first()
    
    if customer_user and customer_user.fcm_token:
        await send_push_notification(
            fcm_token=customer_user.fcm_token,
            title="Booking Status Update",
            body=f"Your booking has been {status_update.status}",
            data={"booking_id": str(booking.id)}
        )
        
    await db.commit()
    return booking
