import sys
import asyncio
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from app.api.endpoints import auth, merchants, bookings, payments, admin
from app.utils.fcm import init_firebase
from app.database import engine
from app.models.models import Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Bokivo API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase and DB on startup
@app.on_event("startup")
async def startup():
    try:
        init_firebase()
    except Exception as e:
        print(f"Firebase initialization skipped: {e}")
        
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Database table sync error (will continue): {e}")

# Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(merchants.router, prefix="/api/v1/merchants", tags=["Merchants"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to Bokivo Backend API"}
