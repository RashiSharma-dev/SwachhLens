# 🌿 SwachhLens

> **AI-powered civic waste reporting platform** — Citizens photograph waste, AI classifies it, municipal authorities act on it.

SwachhLens bridges the gap between citizens and municipal bodies by turning a simple photo into an actionable, geo-tagged, AI-analyzed waste complaint — complete with duplicate detection, severity scoring, and gig-economy pickup assignment.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [User Roles](#-user-roles)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 **Waste Reporting** | Citizens capture or upload a photo with GPS coordinates |
| 🤖 **AI Classification** | Auto-tags waste type (plastic, e-waste, hazardous, organic, etc.) |
| 📏 **Volume Estimation** | Estimates waste volume (Small → Very Large) from image |
| 🗺️ **Geo Duplicate Detection** | PostGIS spatial query flags duplicate reports within 50 m / 24 h |
| ⚠️ **Severity Scoring** | Rule engine scores 1–100 based on volume, frequency, and proximity to sensitive locations |
| 🚛 **Intervention Routing** | Automatically recommends: cleanup team / mini truck / escalation / broadcast to Swachh-Preneurs |
| ✅ **Cleanup Verification** | Workers upload after photos; AI confirms resolution |
| 🧑‍💼 **Authority Dashboard** | Protected stats, intervention lists, live worker tracking |
| 📊 **Analytics** | Complaint breakdown by status and waste category via Recharts |
| 🏅 **Green Credits** | Citizens earn points for verified reports and cleaned areas |
| 🔄 **Live Worker Tracking** | Real-time map of sanitation workers via Leaflet |

---

## 🏛️ Architecture

```
+----------------------------------------------------------+
|                    CITIZEN / AUTHORITY                   |
|                  (Browser / Mobile Web)                  |
+---------------------------+------------------------------+
                            | HTTPS
                            v
+----------------------------------------------------------+
|                  FRONTEND  (Netlify)                     |
|                                                          |
|  React 19 + Vite 8 + TailwindCSS 4                       |
|  +-------------+  +--------------+  +----------------+  |
|  |  Auth Pages |  | Citizen View |  | Authority Dash |  |
|  |  Login /    |  | Report Waste |  | Stats / Map /  |  |
|  |  Signup     |  | My Impact    |  | Live Tracking  |  |
|  +-------------+  +--------------+  +----------------+  |
|                                                          |
|  react-router-dom  react-leaflet  recharts               |
|  react-webcam      framer-motion  lucide-react           |
+---------------------------+------------------------------+
                            | REST API (JSON / multipart)
                            v
+----------------------------------------------------------+
|                  BACKEND  (Render)                       |
|                                                          |
|  FastAPI + Uvicorn                                       |
|  +----------------------------------------------------+  |
|  |                     main.py                        |  |
|  |  +---------+  +---------------+  +-------------+  |  |
|  |  |  Auth   |  |  Reporting    |  |  Analytics  |  |  |
|  |  | /signup |  | /report-waste |  | /dashboard  |  |  |
|  |  | /login  |  | /verify-      |  | /workers/   |  |  |
|  |  | JWT/    |  |  cleanup      |  |  live-track |  |  |
|  |  | bcrypt  |  | /accept-      |  |             |  |  |
|  |  +---------+  |  pickup       |  +-------------+  |  |
|  |               +---------------+                   |  |
|  +----------------------------------------------------+  |
|                          |                               |
|  +---------------------  v  -------------------------+  |
|  |              ai_processor.py                       |  |
|  |  classify_waste()       -> waste tags              |  |
|  |  estimate_volume()      -> Small/Medium/Large/VL   |  |
|  |  determine_intervention() -> score + action        |  |
|  |  verify_cleanup()       -> Resolved / Pending      |  |
|  +---------------------  |  -------------------------+  |
|                           |                              |
|  +---------------------  v  -------------------------+  |
|  |          SQLAlchemy ORM / Raw SQL                  |  |
|  |  Dev:  SQLite (file-based, zero config)            |  |
|  |  Prod: PostgreSQL + PostGIS (spatial queries)      |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
                            |
           +----------------+----------------+
           |    SQLite (dev) / PostgreSQL     |
           |          + PostGIS               |
           |  Duplicate check:                |
           |  ST_DWithin(location, 50m)       |
           +----------------------------------+
```

### Data Flow — Waste Report Submission

```
Citizen uploads photo + GPS coords
        |
        v
POST /api/report-waste (multipart/form-data)
        |
        +---> classify_waste(image)      -> ["plastic waste", "overflowing bin"]
        +---> estimate_volume(image)     -> "Large"
        +---> PostGIS duplicate check    -> is_duplicate=False
        +---> determine_intervention()   -> score=75, "Dispatch extra workers and mini truck"
        |
        v
WasteReportResponse (JSON)
  { id, lat, lng, ai_tags, estimated_volume,
    is_duplicate, ai_severity_score, intervention }
```

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | TailwindCSS 4 |
| Routing | React Router DOM 7 |
| Maps | Leaflet + react-leaflet |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Camera | react-webcam |
| Notifications | react-hot-toast |
| Linting | oxlint |

### Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| ORM | SQLAlchemy |
| Database (dev) | SQLite |
| Database (prod) | PostgreSQL + PostGIS |
| Auth | JWT (PyJWT) + bcrypt (passlib) |
| Validation | Pydantic v2 |
| File Uploads | python-multipart |

### Infrastructure

| Service | Platform |
|---|---|
| Frontend Hosting | Netlify |
| Backend Hosting | Render (free tier) |
| CI/CD | Netlify auto-deploy on git push |

---

## 📁 Project Structure

```
swachhlens/
├── README.md
├── netlify.toml              # Netlify build + SPA redirect config
│
├── frontend/                 # React + Vite application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # All pages + routing (single-file SPA)
│       └── index.css         # Global styles
│
└── backend/                  # FastAPI application
    ├── main.py               # All routes, auth, DB logic
    ├── ai_processor.py       # AI classification & intervention engine
    ├── requirements.txt      # Python dependencies
    └── render.yaml           # Render.com deployment config
```

---

## 🚀 Local Setup

### Prerequisites

- **Node.js** >= 20
- **Python** >= 3.11
- **pip** (comes with Python)

### 1. Clone the repo

```bash
git clone https://github.com/your-org/swachhlens.git
cd swachhlens
```

### 2. Start the Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the dev server
uvicorn main:app --reload --port 8000
```

API will be available at: **http://localhost:8000**
Swagger docs at: **http://localhost:8000/docs**

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🔐 Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./swachhlens.db` | DB connection string. Set to `postgresql+psycopg2://...` for production with PostGIS |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin (set to your Netlify URL in production) |

> **Note:** `SECRET_KEY` is currently hardcoded as a dev mock. **Generate a secure random key for production** and inject it as an environment variable.

### Frontend

Create `frontend/.env` for local overrides:

```env
VITE_API_URL=http://localhost:8000
```

---

## 📡 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Register as citizen or authority |
| `POST` | `/api/auth/login` | No | Login, receive JWT token |

**Signup body:**
```json
{
  "role": "citizen",
  "mobile": "9876543210",
  "password": "yourpassword"
}
```

**Login body:**
```json
{
  "username": "9876543210",
  "password": "yourpassword"
}
```

---

### Waste Reporting

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/report-waste` | No | Submit a waste report with photo |
| `POST` | `/api/verify-cleanup` | No | Verify cleanup with after-photo |
| `POST` | `/api/accept-pickup` | No | Gig worker accepts a pickup task |

**Report Waste** — `multipart/form-data`:

| Field | Type | Description |
|---|---|---|
| `image` | `file` | Waste photo |
| `latitude` | `float` | GPS latitude |
| `longitude` | `float` | GPS longitude |
| `timestamp` | `datetime` | ISO timestamp (optional, defaults to now) |
| `comments` | `string` | Additional notes (optional) |

**Response:**
```json
{
  "id": 1,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timestamp": "2026-08-13T18:00:00",
  "ai_tags": ["plastic waste", "overflowing bin"],
  "estimated_volume": "Large",
  "is_duplicate": false,
  "primary_complaint_id": null,
  "ai_severity_score": 75,
  "intervention": "Dispatch extra workers and mini truck"
}
```

---

### Citizen

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/my-impact/{user_id}` | No | Green credit points and notifications |

---

### Authority (JWT Required)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard-stats` | Authority JWT | Total reports, pending cleanups, duplicates |
| `GET` | `/api/actionable-interventions` | Authority JWT | List of available interventions |

---

### Analytics & Tracking

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard-stats` | No | Complaint count, status and category breakdown |
| `GET` | `/api/workers/live-tracking` | No | Real-time worker locations |

---

## 🌐 Deployment

### Frontend → Netlify

The `netlify.toml` in the repo root handles everything automatically on every `git push`:

```toml
[build]
  base    = "frontend"
  command = "npm run build"
  publish = "frontend/dist"
```

Set in your Netlify project settings:

```
VITE_API_URL = https://swachhlens-api.onrender.com
```

### Backend → Render

The `backend/render.yaml` configures the Render service:

```yaml
services:
  - type: web
    name: swachhlens-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set in your Render dashboard:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL + PostGIS connection string |
| `FRONTEND_URL` | `https://your-app.netlify.app` |
| `SECRET_KEY` | A long, random secret string |

> **Upgrading to PostGIS:** Once you provision PostgreSQL with the PostGIS extension enabled, update `DATABASE_URL` — the spatial duplicate-detection query (`ST_DWithin`) will activate automatically.

---

## 👥 User Roles

### 🧑 Citizen
- Sign up with mobile number
- Submit waste reports via camera or file upload
- Track personal green credit points and notifications

### 🏛️ Municipal Authority
- Sign up with email and employee ID
- Access protected dashboard (JWT with `role: authority`)
- View analytics, complaint breakdowns, live worker map

### ♻️ Swachh-Preneur (Gig Recycler)
- Accepts recyclable pickup broadcasts
- Calls `POST /api/accept-pickup` to claim tasks

---

## 📝 Developer Notes

| Area | Current State | Upgrade Path |
|---|---|---|
| **AI Model** | Random mock in `ai_processor.py` | Swap in Gemini Vision / TFLite model calls |
| **User Store** | In-memory Python dict (resets on restart) | Persist to DB with a `users` table |
| **PostGIS Dedup** | Graceful fallback on SQLite | Provision PostgreSQL + PostGIS on Render |
| **Secret Key** | Hardcoded dev string | Inject as `SECRET_KEY` env var |
| **Worker Tracking** | Simulated random movement | Connect to real GPS telemetry API |

---

*Built with 💚 to make Indian cities cleaner, one photo at a time.*
