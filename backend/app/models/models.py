from sqlalchemy import Column, String, ForeignKey, Enum, DateTime, Boolean, Numeric, Float, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
import uuid
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'customer' or 'merchant'
    fcm_token = Column(String, nullable=True)
    
    # Relationships
    merchant_profile = relationship("Merchant", back_populates="user", uselist=False, lazy="selectin")
    customer_bookings = relationship("Booking", back_populates="customer", foreign_keys="Booking.customer_id", lazy="selectin")

class Merchant(Base):
    __tablename__ = "merchants"
    
    id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    shop_name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, default=12.9716)
    longitude = Column(Float, default=77.5946)
    service_type = Column(String, nullable=False)
    base_price = Column(Numeric(precision=10, scale=2), nullable=False)
    rating = Column(Float, default=0.0)
    is_subscribed = Column(Boolean, default=False)
    subscription_end = Column(DateTime, nullable=True)
    image_url = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="merchant_profile")
    bookings = relationship("Booking", back_populates="merchant", foreign_keys="Booking.merchant_id")
    payments = relationship("SubscriptionPayment", back_populates="merchant", order_by="desc(SubscriptionPayment.created_at)")

class SubscriptionPayment(Base):
    __tablename__ = "subscription_payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False)
    utr_number = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    plan_name = Column(String, default="Bokivo Partner Pro (Monthly)")
    status = Column(String, default="verified") # 'verified', 'pending', 'rejected'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    merchant = relationship("Merchant", back_populates="payments")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False)
    status = Column(String, default="pending") # 'pending', 'accepted', 'declined', 'completed'
    booking_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    customer = relationship("User", back_populates="customer_bookings", foreign_keys=[customer_id])
    merchant = relationship("Merchant", back_populates="bookings", foreign_keys=[merchant_id])
