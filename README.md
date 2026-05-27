# Construction Site Safety Training & Compliance System

A full-stack web application for managing construction site safety training and compliance.

## Overview
Workers complete mandatory role-based safety training, pass timed assessments, and receive digital certificates before being permitted to work on site. Admins manage training content, monitor compliance, and control site eligibility.

## Tech Stack
- **Frontend:** React + Material UI
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt

## Features
- Role-based access control (Worker & Admin)
- Video progress tracking with anti-skip protection
- Timed multiple choice quiz with auto-scoring
- Automated PDF certificate generation (1-year expiry)
- Admin compliance dashboard and reports

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Create .env file with your DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

