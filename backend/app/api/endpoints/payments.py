from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.models import Merchant, User
from app.schemas.schemas import PaymentCreateOrder, PaymentVerify
from app.utils.razorpay import create_order, verify_signature
from datetime import datetime, timedelta
from app.api.endpoints.bookings import get_current_user

router = APIRouter()

@router.post("/create-order")
async def pay_create_order(payload: PaymentCreateOrder, current_user: User = Depends(get_current_user)):
    """
    Generate a Razorpay Order ID.
    """
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can subscribe")
        
    try:
        order = create_order(payload.amount)
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
async def pay_verify(payload: PaymentVerify, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Validate razorpay_signature and update Merchant subscription status.
    """
    is_valid = verify_signature(
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Update Subscription status
    query = select(Merchant).where(Merchant.id == current_user.id)
    result = await db.execute(query)
    merchant = result.scalars().first()
    
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")
    
    merchant.is_subscribed = True
    
    # Extend subscription by 30 days
    if merchant.subscription_end and merchant.subscription_end > datetime.utcnow():
        merchant.subscription_end += timedelta(days=30)
    else:
        merchant.subscription_end = datetime.utcnow() + timedelta(days=30)
        
    await db.commit()
    return {"status": "success", "subscription_end": merchant.subscription_end}
