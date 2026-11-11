from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Union
from uuid import UUID
from datetime import datetime
from decimal import Decimal

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str # 'customer' or 'merchant'
    fcm_token: Optional[str] = None

class UserCreate(UserBase):
    password: str
    otp: Optional[str] = None
    shop_name: Optional[str] = None
    address: Optional[str] = None
    service_type: Optional[str] = None
    base_price: Optional[Decimal] = None
    image_url: Optional[str] = None

class SendOTPRequest(BaseModel):
    email: EmailStr

class SendEmailChangeOTPRequest(BaseModel):
    new_email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    new_email: Optional[EmailStr] = None
    email_otp: Optional[str] = None

class MerchantProfile(BaseModel):
    shop_name: str
    address: str
    service_type: str
    base_price: Decimal
    rating: float
    is_subscribed: bool
    subscription_end: Optional[datetime]
    lat: float
    lng: float
    image_url: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    merchant_profile: Optional[MerchantProfile] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Booking schemas
class BookingBase(BaseModel):
    merchant_id: UUID
    booking_date: datetime

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    status: str # 'accepted', 'declined', 'completed'

class BookingResponse(BaseModel):
    id: UUID
    customer_id: UUID
    merchant_id: UUID
    status: str
    booking_date: datetime
    created_at: datetime
    shop_name: Optional[str] = None
    service_type: Optional[str] = None
    address: Optional[str] = None
    base_price: Optional[Decimal] = None

    class Config:
        from_attributes = True

# Merchant response schemas
class MerchantDiscoveryResponse(BaseModel):
    id: UUID
    shop_name: str
    service_type: str
    address: str
    lat: float
    lng: float
    rating: float
    base_price: Decimal
    is_subscribed: bool
    subscription_end: Optional[datetime]

    class Config:
        from_attributes = True

# Payment schemas
class PaymentCreateOrder(BaseModel):
    amount: int # In paise

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class UPIPlanInfo(BaseModel):
    upi_id: str
    payee_name: str
    trial_fee: float
    monthly_amount: float
    quarterly_amount: float
    halfyearly_amount: float
    annual_amount: float

class SubmitUTRRequest(BaseModel):
    utr_number: str
    merchant_upi_id: Optional[str] = None # Valid merchant UPI ID linked for auto-pay / mandate verification
    plan_cycle: str # 'trial', 'monthly', 'quarterly', 'halfyearly', 'annual'
    amount: float
