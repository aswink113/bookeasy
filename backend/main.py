from fastapi import FastAPI
from app.api.endpoints import auth, merchants, bookings, payments
from app.utils.fcm import init_firebase
from app.database import engine
from app.models.models import Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Bookeasy API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase on startup
@app.on_event("startup")
async def startup():
    init_firebase()
    # Create tables (not recommended for production, use Alembic)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(merchants.router, prefix="/api/v1/merchants", tags=["Merchants"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])

@app.get("/")
async def root():
    return {"message": "Welcome to Bookeasy Backend API"}
