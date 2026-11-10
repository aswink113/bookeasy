# Bokivo

A clean, modern ecosystem with a single central **FastAPI backend** powering both the **Web Platform (React)** and the **Mobile App (Flutter)**.

---

## 📁 Repository Structure

```
bokivo/
├── backend/              # Central FastAPI REST API (powers Web & Mobile)
│   ├── app/
│   │   ├── api/          # Endpoints: auth, merchants, bookings, payments, admin
│   │   ├── core/         # Config, JWT, security
│   │   ├── models/       # PostGIS & SQLAlchemy database models
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── utils/        # Firebase FCM, Geocoding, Razorpay
│   ├── main.py           # FastAPI entrypoint
│   └── requirements.txt  # Python backend dependencies
│
├── web/                  # Complete Web Frontend (React + Vite)
│   ├── src/
│   │   ├── screens/      # IntroScreen, Login, Signup, CustomerHome, MerchantDashboard, AdminDashboard
│   │   ├── services/     # apiService (connects to backend: 127.0.0.1:8000)
│   │   ├── theme/        # Bokivo design tokens & theme constants
│   │   ├── widgets/      # Shared components (TermsModal, etc.)
│   │   └── App.jsx       # Client router & app shell
│   ├── package.json      # Dependencies (lucide-react, vite, react)
│   └── index.html        # Web page title & entrypoint
│
└── mobile/               # Mobile Application (Flutter)
    ├── lib/
    │   ├── screens/      # intro_screen, login_screen, signup_screen, customer_home, etc.
    │   ├── services/     # api_service.dart (connects to central backend)
    │   ├── theme/        # Flutter AppTheme & color schemes
    │   └── widgets/      # TermsModal & UI widgets
    ├── android/          # Android deployment & Gradle setup
    ├── ios/              # iOS project & Info.plist
    └── pubspec.yaml      # Flutter dependencies
```

---

## 🚀 Getting Started

### 1. Central Backend (FastAPI)
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- API Root: `http://127.0.0.1:8000/`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`

---

### 2. Web Application (React + Vite)
Includes Customer Discovery, Merchant Studio, and Admin Intelligence Dashboard.
```bash
cd web
npm install
npm run dev
```
- Open `http://127.0.0.1:5173` in your browser.

---

### 3. Mobile Application (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```
