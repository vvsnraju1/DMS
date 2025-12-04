# Login Troubleshooting Guide

## Issue: Cannot login with admin / Admin@123456

Follow these steps to diagnose and fix the issue:

## Step 1: Verify Database is Initialized

```bash
# Check if database exists
psql -U postgres -p 5433 -c "\l" | findstr dms_db

# Check if tables exist
psql -U postgres -p 5433 -d dms_db -c "\dt"

# Check if admin user exists
psql -U postgres -p 5433 -d dms_db -c "SELECT id, username, email, is_active FROM users WHERE username='admin';"
```

**Expected Result:**
- Database `dms_db` should exist
- Tables: users, roles, user_roles, audit_logs should exist
- Admin user should be present and active

**If admin user doesn't exist, initialize the database:**
```bash
cd backend
python scripts/init_db.py
```

## Step 2: Verify Backend is Running

```bash
# Test backend health
curl http://localhost:8000/health

# Should return: {"status":"healthy"}
```

**If backend is not running:**
```bash
cd backend
python run.py
```

## Step 3: Test Login via API Directly

```bash
# Test login with curl
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"admin\", \"password\": \"Admin@123456\"}"
```

**Expected Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@pharma-dms.com",
    "full_name": "System Administrator",
    "roles": ["DMS_Admin"],
    "is_active": true
  },
  "requires_password_change": false
}
```

## Step 4: Check Frontend Configuration

**File: `frontend/.env`**

Should contain:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**If file doesn't exist:**
```bash
cd frontend
echo VITE_API_BASE_URL=http://localhost:8000/api/v1 > .env
```

## Step 5: Check Browser Console

1. Open frontend: http://localhost:3000
2. Open browser DevTools (F12)
3. Go to Console tab
4. Try to login
5. Look for errors

**Common errors:**
- CORS error → Backend CORS not configured
- Network error → Backend not running
- 401 Unauthorized → Wrong credentials or database issue
- 404 Not Found → Wrong API URL

## Step 6: Check Backend Logs

When you try to login, check the backend terminal for errors:
- Look for database connection errors
- Look for authentication errors
- Look for any Python exceptions

## Common Solutions

### Solution 1: Database Not Initialized

```bash
cd backend

# Reset and reinitialize database
python scripts/reset_db.py
# Type 'yes' when prompted

# Or just initialize if empty
python scripts/init_db.py
```

### Solution 2: Backend Not Running on Port 8000

```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# If something else is using it, kill it or change port
# To change port, edit backend/run.py or start manually:
uvicorn app.main:app --port 8001 --reload

# Then update frontend/.env:
VITE_API_BASE_URL=http://localhost:8001/api/v1
```

### Solution 3: CORS Issue

Edit `backend/app/main.py` and verify CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Solution 4: Frontend Not Connected to Backend

1. Stop frontend (Ctrl+C)
2. Verify `.env` file exists in frontend folder
3. Restart frontend:
```bash
cd frontend
npm run dev
```

### Solution 5: Password Issue

If you want to reset the admin password:

```bash
# Connect to database
psql -U postgres -p 5433 -d dms_db

# Check current admin user
SELECT id, username, email, is_active FROM users WHERE username='admin';

# If you need to delete and recreate
DELETE FROM user_roles WHERE user_id = 1;
DELETE FROM users WHERE username='admin';
\q

# Then reinitialize
cd backend
python scripts/init_db.py
```

## Quick Diagnostic Script

Run this to check everything at once:

```bash
# Create a file: check_system.bat (Windows) or check_system.sh (Linux/Mac)

@echo off
echo === Checking Pharma DMS System ===
echo.

echo [1] Checking Database...
psql -U postgres -p 5433 -d dms_db -c "SELECT COUNT(*) as user_count FROM users;" 2>nul
if errorlevel 1 (
    echo ERROR: Cannot connect to database
) else (
    echo OK: Database connected
)
echo.

echo [2] Checking Backend...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ERROR: Backend not responding
) else (
    echo OK: Backend is running
)
echo.

echo [3] Checking Admin User...
psql -U postgres -p 5433 -d dms_db -c "SELECT username, is_active FROM users WHERE username='admin';" 2>nul
echo.

echo [4] Testing Login API...
curl -X POST "http://localhost:8000/api/v1/auth/login" -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"Admin@123456\"}" 2>nul
echo.

pause
```

## Step-by-Step Verification

Follow this exact sequence:

### 1. Ensure PostgreSQL is running
```bash
sc query postgresql-18
# Should show: STATE : 4 RUNNING
```

### 2. Create database (if not exists)
```bash
psql -U postgres -p 5433 -f setup_database.sql
```

### 3. Setup backend environment
```bash
cd backend
copy env_postgres18.txt .env
```

### 4. Initialize database
```bash
python scripts/init_db.py
```

**Look for this output:**
```
============================================================
Pharma DMS - Database Initialization
============================================================
Creating database tables...
✓ Tables created successfully

Seeding roles...
✓ Created roles: Author, Reviewer, Approver, DMS_Admin

Seeding admin user...
✓ Admin user created successfully
  Username: admin
  Email: admin@pharma-dms.com
  Password: Admin@123456
```

### 5. Start backend
```bash
python run.py
```

**Should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 6. Test backend API
Open: http://localhost:8000/api/docs
- Click "Try it out" on POST /auth/login
- Enter: {"username": "admin", "password": "Admin@123456"}
- Should return 200 with access token

### 7. Setup frontend
```bash
cd frontend

# Create .env file
echo VITE_API_BASE_URL=http://localhost:8000/api/v1 > .env

# Install and start
npm install
npm run dev
```

### 8. Test login
- Open http://localhost:3000
- Enter admin / Admin@123456
- Should redirect to dashboard

## Still Not Working?

If none of the above work, please provide:

1. **Backend terminal output** when you try to login
2. **Frontend browser console errors** (F12 → Console tab)
3. **Result of:** `psql -U postgres -p 5433 -d dms_db -c "SELECT * FROM users WHERE username='admin';"`
4. **Result of:** `curl -X POST "http://localhost:8000/api/v1/auth/login" -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"Admin@123456\"}"`

This will help identify the exact issue!

