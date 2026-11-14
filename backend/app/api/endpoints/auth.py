from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.models import User, Merchant
from app.schemas.schemas import UserCreate, UserResponse, Token, SendOTPRequest, VerifyOTPRequest, SendEmailChangeOTPRequest, UpdateProfileRequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.utils.geo import geocode_address
from app.utils.email_otp import send_verification_otp, verify_otp
from datetime import timedelta
from app.core.config import settings
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer

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

@router.post("/send-otp")
async def send_otp(req: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    # Check if email is already taken
    query = select(User).where(User.email == req.email)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Account with this email already exists")

    otp = await send_verification_otp(req.email)
    return {
        "success": True,
        "message": f"Verification OTP sent to {req.email}",
        # For seamless developer testing when SMTP password not yet provided
        "dev_hint": otp if not settings.SMTP_PASSWORD else None
    }

@router.post("/verify-otp")
async def check_otp(req: VerifyOTPRequest):
    valid = verify_otp(req.email, req.otp)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"success": True, "message": "Email verified successfully"}

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # If OTP is sent, verify it
    if user_in.otp:
        if not verify_otp(user_in.email, user_in.otp):
            raise HTTPException(status_code=400, detail="Invalid or expired verification OTP")

    # Check if user already exists
    query = select(User).where(User.email == user_in.email)
    result = await db.execute(query)
    user = result.scalars().first()
    if user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create User
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        fcm_token=user_in.fcm_token
    )
    db.add(new_user)
    await db.flush() # To get User.id
    
    # If role is merchant, create Merchant profile
    if user_in.role == "merchant":
        if not user_in.shop_name or not user_in.address:
            raise HTTPException(status_code=400, detail="Merchant shop name and address required")
        
        # Geocode address if explicit coordinates not supplied
        if user_in.latitude is not None and user_in.longitude is not None:
            lat, lng = user_in.latitude, user_in.longitude
        else:
            try:
                lat, lng = await geocode_address(user_in.address)
            except Exception:
                lat, lng = 12.9716, 77.5946
            
        new_merchant = Merchant(
            id=new_user.id,
            shop_name=user_in.shop_name,
            address=user_in.address,
            service_type=user_in.service_type or "General",
            base_price=user_in.base_price or 0.0,
            latitude=lat,
            longitude=lng,
            image_url=user_in.image_url
        )
        db.add(new_merchant)
    
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == form_data.username)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/send-email-change-otp")
async def send_email_change_otp(
    req: SendEmailChangeOTPRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send verification OTP to a new proposed email address for profile update"""
    new_email = req.new_email.strip().lower()

    if new_email == current_user.email.lower():
        raise HTTPException(status_code=400, detail="New email must be different from your current email")

    # Check if another user already has this email
    query = select(User).where(User.email == new_email)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="An account with this email address already exists")

    otp = await send_verification_otp(new_email)
    return {
        "success": True,
        "message": f"Verification code sent to {new_email}",
        "dev_hint": otp if not settings.SMTP_PASSWORD else None
    }

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile: username/name, or email (strictly requiring correct OTP for new email)"""
    # 1. Update Name if provided
    if req.name and req.name.strip():
        current_user.name = req.name.strip()

    # 2. Update Email if provided
    if req.new_email:
        new_email = req.new_email.strip().lower()
        if new_email != current_user.email.lower():
            if not req.email_otp:
                raise HTTPException(
                    status_code=400,
                    detail="Verification OTP is required to change your email address"
                )

            # Strictly verify the OTP for the new email
            is_valid = verify_otp(new_email, req.email_otp)
            if not is_valid:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid or expired OTP for the new email. Email update rejected."
                )

            # Check again if another account grabbed the email
            check_q = select(User).where(User.email == new_email, User.id != current_user.id)
            conflict = (await db.execute(check_q)).scalars().first()
            if conflict:
                raise HTTPException(
                    status_code=400,
                    detail="An account with this email address is already in use"
                )

            current_user.email = new_email

    await db.commit()
    await db.refresh(current_user)
    return current_user
