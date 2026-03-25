from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.models import User, Merchant
from app.schemas.schemas import UserCreate, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.utils.geo import geocode_address
from datetime import timedelta
from app.core.config import settings

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
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
        
        # Geocode address
        try:
            lat, lng = await geocode_address(user_in.address)
        except Exception:
            # Fallback Bangalore for demo
            lat, lng = 12.9716, 77.5946
            
        new_merchant = Merchant(
            id=new_user.id,
            shop_name=user_in.shop_name,
            address=user_in.address,
            service_type=user_in.service_type or "General",
            base_price=user_in.base_price or 0.0,
            location=f'SRID=4326;POINT({lng} {lat})' # Longitude Latitude in PostGIS
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
