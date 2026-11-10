from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.models import Booking, User, Merchant
from app.schemas.schemas import BookingCreate, BookingResponse, BookingUpdate
from app.utils.fcm import send_push_notification
from app.utils.email_otp import send_booking_confirmation_email
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
    # Normalize datetime: make it naive UTC datetime for PostgreSQL TIMESTAMP WITHOUT TIME ZONE
    b_date = booking_in.booking_date
    if b_date.tzinfo is not None:
        b_date = b_date.replace(tzinfo=None)

    # Create booking request
    new_booking = Booking(
        customer_id=current_user.id,
        merchant_id=booking_in.merchant_id,
        booking_date=b_date,
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
    await db.refresh(new_booking)
    
    # Query merchant details to populate response fields
    m_res = await db.execute(select(Merchant).where(Merchant.id == new_booking.merchant_id))
    m = m_res.scalars().first()
    
    # Send Booking Confirmation Email to Customer
    try:
        formatted_date = new_booking.booking_date.strftime("%A, %d %B %Y at %I:%M %p")
        await send_booking_confirmation_email(
            customer_email=current_user.email,
            customer_name=current_user.name,
            shop_name=m.shop_name if m else "Service Partner",
            service_type=m.service_type if m else "General Service",
            address=m.address if m else "Partner Address",
            booking_date=formatted_date,
            base_price=float(m.base_price) if m and m.base_price else 0.0,
            booking_id=str(new_booking.id)
        )
    except Exception as e:
        print(f"[BOOKING EMAIL ERROR]: {e}")
    
    return BookingResponse(
        id=new_booking.id,
        customer_id=new_booking.customer_id,
        merchant_id=new_booking.merchant_id,
        status=new_booking.status,
        booking_date=new_booking.booking_date,
        created_at=new_booking.created_at,
        shop_name=m.shop_name if m else None,
        service_type=m.service_type if m else None,
        address=m.address if m else None,
        base_price=m.base_price if m else None,
    )

@router.get("/customer", response_model=List[BookingResponse])
async def get_customer_bookings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    query = select(Booking, Merchant).outerjoin(Merchant, Booking.merchant_id == Merchant.id).where(Booking.customer_id == current_user.id).order_by(Booking.created_at.desc())
    result = await db.execute(query)
    rows = result.all()
    
    responses = []
    for booking, merchant in rows:
        responses.append(BookingResponse(
            id=booking.id,
            customer_id=booking.customer_id,
            merchant_id=booking.merchant_id,
            status=booking.status,
            booking_date=booking.booking_date,
            created_at=booking.created_at,
            shop_name=merchant.shop_name if merchant else "Service Partner",
            service_type=merchant.service_type if merchant else "Service",
            address=merchant.address if merchant else "",
            base_price=merchant.base_price if merchant else None,
        ))
    return responses

@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(booking_id: UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    query = select(Booking).where(Booking.id == booking_id, Booking.customer_id == current_user.id)
    result = await db.execute(query)
    booking = result.scalars().first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = "cancelled"
    await db.commit()
    await db.refresh(booking)
    
    m_res = await db.execute(select(Merchant).where(Merchant.id == booking.merchant_id))
    m = m_res.scalars().first()
    
    return BookingResponse(
        id=booking.id,
        customer_id=booking.customer_id,
        merchant_id=booking.merchant_id,
        status=booking.status,
        booking_date=booking.booking_date,
        created_at=booking.created_at,
        shop_name=m.shop_name if m else None,
        service_type=m.service_type if m else None,
        address=m.address if m else None,
        base_price=m.base_price if m else None,
    )

@router.get("/merchant", response_model=List[BookingResponse])
async def get_merchant_bookings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Forbidden")
    
    query = (
        select(Booking, User, Merchant)
        .outerjoin(User, Booking.customer_id == User.id)
        .outerjoin(Merchant, Booking.merchant_id == Merchant.id)
        .where(Booking.merchant_id == current_user.id)
        .order_by(Booking.created_at.desc())
    )
    result = await db.execute(query)
    rows = result.all()
    
    responses = []
    for booking, customer_user, merchant in rows:
        responses.append(BookingResponse(
            id=booking.id,
            customer_id=booking.customer_id,
            merchant_id=booking.merchant_id,
            status=booking.status,
            booking_date=booking.booking_date,
            created_at=booking.created_at,
            shop_name=customer_user.name if customer_user else "Customer",
            service_type=merchant.service_type if merchant else "Service",
            address=merchant.address if merchant else "",
            base_price=merchant.base_price if merchant else None,
        ))
    return responses

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
