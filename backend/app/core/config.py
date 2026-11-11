import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/bookeasy")
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_MINUTES = 60
    
    # Integrations
    GOOGLE_GEOCODING_API_KEY = os.getenv("GOOGLE_GEOCODING_API_KEY", "")
    FIREBASE_SERVICE_ACCOUNT_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    # Email OTP Configuration
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", "bokivo.team@gmail.com")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM = os.getenv("SMTP_FROM", "bokivo.team@gmail.com")

    # Storage
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

    # Direct UPI Payment Gateway Configuration
    UPI_ID = os.getenv("UPI_ID", "bokivo@upi")
    UPI_PAYEE_NAME = os.getenv("UPI_PAYEE_NAME", "Bokivo Partner Network")
    SUBSCRIPTION_MONTHLY_PRICE = float(os.getenv("SUBSCRIPTION_MONTHLY_PRICE", "499.0"))
    SUBSCRIPTION_QUARTERLY_PRICE = float(os.getenv("SUBSCRIPTION_QUARTERLY_PRICE", "1299.0"))
    SUBSCRIPTION_ANNUAL_PRICE = float(os.getenv("SUBSCRIPTION_ANNUAL_PRICE", "4499.0"))

settings = Settings()
