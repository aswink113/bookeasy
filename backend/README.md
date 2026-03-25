# Bookeasy Backend (FastAPI)

This is the Python-based backend for the Bookeasy application.

## 🚀 Features
- **Auth**: JWT-based Authentication with Role-Based Access Control (Customer/Merchant).
- **PostGIS Discovery**: Find nearby merchants within a specified radius using geographic coordinates.
- **Booking Management**: Create, accept, and decline bookings with real-time push notifications.
- **Push Notifications**: Integrated with Firebase Cloud Messaging (FCM).
- **Payment & Subscriptions**: Razorpay integration for merchant subscriptions.
- **Geocoding**: Automatic address-to-coordinate conversion using Google Geocoding API.

## 🛠️ Tech Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: SQLAlchemy (Async)
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Payments**: Razorpay

## ⚙️ Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Database**:
   Ensure you have PostgreSQL with PostGIS installed. Create a database named `bookeasy`.
   Install PostGIS extension:
   ```sql
   CREATE EXTENSION postgis;
   ```

3. **Environment Variables**:
   Update the `.env` file with your credentials:
   - `DATABASE_URL`
   - `GOOGLE_GEOCODING_API_KEY`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`

4. **Run the App**:
   ```bash
   uvicorn main:app --reload
   ```

## 🔍 API Documentation
Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`
