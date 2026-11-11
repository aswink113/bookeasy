from sqlalchemy import Column, String, ForeignKey, Enum, DateTime, Boolean, Numeric, Float, text, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
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
    gallery_photos = Column(JSONB, default=list)
    sub_services = Column(JSONB, default=list)
    
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
    has_reviewed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    customer = relationship("User", back_populates="customer_bookings", foreign_keys=[customer_id])
    merchant = relationship("Merchant", back_populates="bookings", foreign_keys=[merchant_id])
    review = relationship("Review", back_populates="booking", uselist=False)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=False, unique=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False)
    rating = Column(Float, nullable=False) # 1.0 to 5.0
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="review")
    merchant = relationship("Merchant", foreign_keys=[merchant_id])
    customer = relationship("User", foreign_keys=[customer_id])

class MasterCategory(Base):
    __tablename__ = "master_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), default="✨", nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sub_categories = relationship("MasterSubCategory", back_populates="category", cascade="all, delete-orphan", lazy="selectin")

class MasterSubCategory(Base):
    __tablename__ = "master_sub_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("master_categories.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(120), nullable=False)
    default_price = Column(Numeric(precision=10, scale=2), default=0.0)
    duration_mins = Column(Float, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    category = relationship("MasterCategory", back_populates="sub_categories")

