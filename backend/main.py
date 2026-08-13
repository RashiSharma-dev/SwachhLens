from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import os
import jwt
from passlib.context import CryptContext
from ai_processor import classify_waste, estimate_volume, determine_intervention, verify_cleanup

# ponytail: simple inline mock DB config, no complex boilerplate.
# ponytail: SQLite fallback so the app runs on Render free tier without a Postgres addon.
# Set DATABASE_URL env var to a real postgres:// URL whenever you add a DB.
MOCK_POSTGIS_URL = os.getenv("DATABASE_URL", "sqlite:///./swachhlens.db")
# SQLite needs check_same_thread=False; postgres ignores this kwarg via URL, so guard it.
_connect_args = {"check_same_thread": False} if MOCK_POSTGIS_URL.startswith("sqlite") else {}
engine = create_engine(MOCK_POSTGIS_URL, pool_pre_ping=True, echo=False, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

app = FastAPI(title="SwachhLens API")
# FRONTEND_URL env var = your Netlify URL e.g. https://swachhlens.netlify.app
_origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:5173",
    "http://localhost:4173",
]
app.add_middleware(CORSMiddleware, allow_origins=_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- JWT Config & Mock Users DB (ponytail style) ---
SECRET_KEY = "mock_super_secret_key_ponytail"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# In-memory mock dictionary for Users (per ponytail rules: avoids DB migration boilerplate for a mock)
mock_users_db: Dict[str, dict] = {}

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = mock_users_db.get(user_id)
    if user is None:
        raise credentials_exception
    return user

def require_authority(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "authority":
        raise HTTPException(status_code=403, detail="Access Denied: Municipal Authority role required")
    return current_user

@app.get("/api/dashboard-stats")
def get_protected_dashboard_stats(user: dict = Depends(require_authority)):
    return {"total_reports": 1248, "pending_cleanups": 156, "duplicate_complaints": 342}

@app.get("/api/actionable-interventions")
def get_interventions(user: dict = Depends(require_authority)):
    return {"interventions": ["Assign Manual Cleanup Team", "Dispatch Mini Truck", "Urgent Escalation"]}

# --- AUTH ENDPOINTS ---
class SignupRequest(BaseModel):
    role: str
    mobile: Optional[str] = None
    email: Optional[str] = None
    emp_id: Optional[str] = None
    password: str

class LoginRequest(BaseModel):
    username: str # email or mobile
    password: str

@app.post("/api/auth/signup")
async def signup(request: SignupRequest):
    user_id = request.mobile if request.role == 'citizen' else request.email
    if not user_id:
        raise HTTPException(status_code=400, detail="Mobile or Email required")
        
    if user_id in mock_users_db:
        raise HTTPException(status_code=400, detail="User already registered")
        
    hashed_pwd = get_password_hash(request.password)
    
    mock_users_db[user_id] = {
        "id": user_id,
        "role": request.role,
        "hashed_password": hashed_pwd,
        "emp_id": request.emp_id
    }
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    user = mock_users_db.get(request.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sign up first.")
    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Wrong password. Please try again.")
        
    access_token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}


class WasteReportResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    timestamp: datetime
    comments: Optional[str] = None
    image_url: str
    ai_tags: list[str] = []
    estimated_volume: str = ""
    is_duplicate: bool = False
    primary_complaint_id: Optional[int] = None
    ai_severity_score: int = 0
    intervention: str = ""

def handle_duplicate_detection(db: Session, lat: float, lon: float, timestamp: datetime, category: str):
    """
    ponytail: raw SQL duplicate check using PostGIS geography to avoid ORM boilerplate.
    Returns (is_duplicate, primary_complaint_id)
    """
    query = text("""
        SELECT id 
        FROM complaints 
        WHERE category = :category 
          AND timestamp >= :time_limit
          AND ST_DWithin(location::geography, ST_MakePoint(:lon, :lat)::geography, 50)
        ORDER BY timestamp ASC 
        LIMIT 1
    """)
    
    try:
        # Note: In our pure mock setup without an active Postgres instance, this will exception. 
        # But this represents the functional PostGIS query needed.
        result = db.execute(query, {
            "category": category, 
            "time_limit": timestamp - timedelta(hours=24),
            "lon": lon,
            "lat": lat
        }).fetchone()
        
        if result:
            db.execute(text("UPDATE complaints SET report_frequency = report_frequency + 1 WHERE id = :id"), {"id": result[0]})
            db.commit()
            return True, result[0]
    except Exception:
        # Fallback for when the mock DB is missing the table
        pass
        
    return False, None

@app.post("/api/report-waste", response_model=WasteReportResponse)
async def report_waste(
    latitude: float = Form(...),
    longitude: float = Form(...),
    timestamp: datetime = Form(default_factory=datetime.utcnow),
    comments: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    ai_tags = classify_waste(image)
    estimated_volume = estimate_volume(image)
    primary_category = ai_tags[0] if ai_tags else "unknown"
    
    is_duplicate, primary_id = handle_duplicate_detection(db, latitude, longitude, timestamp, primary_category)
    
    freq = 2 if is_duplicate else 1
    severity_score, intervention = determine_intervention(estimated_volume, ai_tags, freq, 0)
    
    # ponytail: naive mock response, no need for real persistence in a mock
    return {
        "id": 1 if not is_duplicate else 2,
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": timestamp,
        "comments": comments,
        "image_url": f"/static/mock_uploads/{image.filename}",
        "ai_tags": ai_tags,
        "estimated_volume": estimated_volume,
        "is_duplicate": is_duplicate,
        "primary_complaint_id": primary_id,
        "ai_severity_score": severity_score,
        "intervention": intervention
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to SwachhLens API"}

@app.post("/api/verify-cleanup")
async def verify_cleanup_endpoint(
    task_id: int = Form(...),
    after_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # ponytail: naive mock endpoint for cleanup verification
    verification = verify_cleanup(None, after_image)
    if verification["status"] == "Resolved":
        try:
            db.execute(text("UPDATE complaints SET status = 'Resolved' WHERE id = :id"), {"id": task_id})
            db.commit()
        except Exception:
            pass
    return verification

@app.post("/api/accept-pickup")
async def accept_pickup(
    task_id: int = Form(...),
    recycler_id: str = Form(...),
    db: Session = Depends(get_db)
):
    # ponytail: naive mock endpoint for gig economy acceptance
    return {"status": "Accepted", "task_id": task_id, "recycler_id": recycler_id, "message": "Pickup successfully assigned to you."}

@app.get("/api/my-impact/{user_id}")
def get_user_impact(user_id: int):
    # ponytail: mock logic for green credits
    verified_reports = 12
    cleaned_areas = 8
    points = (verified_reports * 50) + (cleaned_areas * 100)
    
    return {
        "points": points,
        "verified_reports": verified_reports,
        "cleaned_areas": cleaned_areas,
        "notifications": [
            {"id": 1, "message": "Thank you! The plastic waste you reported has been recycled.", "date": "2 hours ago", "type": "success"},
            {"id": 2, "message": "Your report at Sector 12 was verified! +50 points", "date": "1 day ago", "type": "info"},
            {"id": 3, "message": "Cleanup completed at Market Bin #4. +100 points", "date": "3 days ago", "type": "success"}
        ]
    }

# --- Analytics and Live Tracking Endpoints ---

@app.get("/api/analytics/dashboard-stats")
def get_dashboard_stats():
    return {
        "total_complaints": 850,
        "status_breakdown": [
            {"name": "Pending", "value": 320},
            {"name": "Resolved", "value": 530}
        ],
        "category_breakdown": [
            {"name": "Plastic", "value": 350},
            {"name": "Organic", "value": 200},
            {"name": "E-Waste", "value": 150},
            {"name": "Hazardous", "value": 150}
        ]
    }

import random
mock_workers = [
    {"id": 1, "name": "Rakesh Kumar", "vehicle": "DL-1M-4321", "lat": 28.6139, "lng": 77.2090, "status": "On-Duty"},
    {"id": 2, "name": "Suresh Singh", "vehicle": "DL-2C-9876", "lat": 28.6200, "lng": 77.2200, "status": "On-Duty"},
    {"id": 3, "name": "Amit Patel", "vehicle": "DL-5G-1122", "lat": 28.6050, "lng": 77.1950, "status": "On-Duty"}
]

@app.get("/api/workers/live-tracking")
def get_live_tracking():
    # Simulate movement by adding small random offsets
    for w in mock_workers:
        w["lat"] += random.uniform(-0.001, 0.001)
        w["lng"] += random.uniform(-0.001, 0.001)
    return mock_workers

