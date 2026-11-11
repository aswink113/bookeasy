from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.models import Merchant, User, SubscriptionPayment
from app.schemas.schemas import PaymentCreateOrder, PaymentVerify, UPIPlanInfo, SubmitUTRRequest
from app.utils.razorpay import create_order, verify_signature
from app.utils.email_otp import send_subscription_receipt_email
from datetime import datetime, timedelta
from app.api.endpoints.bookings import get_current_user
from app.core.config import settings
import re

router = APIRouter()

@router.get("/upi-info", response_model=UPIPlanInfo)
async def get_upi_subscription_info(current_user: User = Depends(get_current_user)):
    """
    Get Bokivo Direct UPI VPA details and subscription tiers for merchant payment.
    """
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can view subscription plans")

    return UPIPlanInfo(
        upi_id=settings.UPI_ID,
        payee_name=settings.UPI_PAYEE_NAME,
        monthly_amount=settings.SUBSCRIPTION_MONTHLY_PRICE,
        quarterly_amount=settings.SUBSCRIPTION_QUARTERLY_PRICE,
        annual_amount=settings.SUBSCRIPTION_ANNUAL_PRICE
    )

@router.get("/status")
async def get_merchant_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current merchant's active subscription status and expiry date"""
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can view status")

    q = select(Merchant).where(Merchant.id == current_user.id)
    merchant = (await db.execute(q)).scalars().first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    is_active = False
    if merchant.is_subscribed and merchant.subscription_end:
        is_active = merchant.subscription_end > datetime.utcnow()

    return {
        "is_subscribed": is_active,
        "subscription_end": merchant.subscription_end,
        "shop_name": merchant.shop_name
    }

@router.post("/submit-utr")
async def submit_upi_utr(
    payload: SubmitUTRRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Process 12-digit UPI UTR number, verify format & uniqueness, activate subscription, and email receipt.
    """
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can activate subscriptions")

    utr = payload.utr_number.strip().upper()

    # Validate UPI UTR: 12-digit alphanumeric standard format used across all Indian banking apps
    if not re.match(r'^[A-Za-z0-9]{12}$', utr):
        raise HTTPException(
            status_code=400,
            detail="Invalid UPI Reference / UTR Number. Must be exactly 12 alphanumeric characters found in your UPI app receipt."
        )

    # Check if this UTR has already been redeemed
    q_utr = select(SubscriptionPayment).where(SubscriptionPayment.utr_number == utr)
    existing_payment = (await db.execute(q_utr)).scalars().first()
    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="This UPI Reference (UTR) number has already been used and activated."
        )

    # Fetch merchant profile
    q_m = select(Merchant).where(Merchant.id == current_user.id)
    merchant = (await db.execute(q_m)).scalars().first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    # Determine duration by plan cycle
    cycle = payload.plan_cycle.lower()
    if cycle == "annual":
        days_to_add = 365
        plan_title = "Bokivo Partner Premium (Annual)"
    elif cycle == "quarterly":
        days_to_add = 90
        plan_title = "Bokivo Partner Pro (Quarterly)"
    else:
        days_to_add = 30
        plan_title = "Bokivo Partner Starter (Monthly)"

    # Calculate new expiry date
    now = datetime.utcnow()
    if merchant.subscription_end and merchant.subscription_end > now:
        merchant.subscription_end += timedelta(days=days_to_add)
    else:
        merchant.subscription_end = now + timedelta(days=days_to_add)

    merchant.is_subscribed = True

    # Record Payment
    payment_record = SubscriptionPayment(
        merchant_id=merchant.id,
        utr_number=utr,
        amount=payload.amount,
        plan_name=plan_title,
        status="verified"
    )
    db.add(payment_record)

    await db.commit()
    await db.refresh(merchant)

    # Send Branded Subscription Receipt Email to Merchant
    try:
        formatted_end = merchant.subscription_end.strftime("%A, %d %B %Y")
        await send_subscription_receipt_email(
            merchant_email=current_user.email,
            merchant_name=current_user.name,
            shop_name=merchant.shop_name,
            plan_name=plan_title,
            amount=payload.amount,
            utr_number=utr,
            subscription_end=formatted_end
        )
    except Exception as e:
        print(f"[SUBSCRIPTION RECEIPT EMAIL ERROR]: {e}")

    return {
        "success": True,
        "message": f"Payment verified! Your Bokivo Partner subscription is active until {merchant.subscription_end.strftime('%d %B %Y')}.",
        "is_subscribed": merchant.is_subscribed,
        "subscription_end": merchant.subscription_end,
        "plan_name": plan_title,
        "utr_number": utr
    }

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
