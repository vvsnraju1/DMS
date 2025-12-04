# Installation Verification Guide

This guide helps you verify that the Pharma DMS system is correctly installed and functioning.

---

## ✅ Pre-Installation Checklist

Before starting, ensure you have:

- [ ] Docker Desktop installed (or Python 3.11+ for manual setup)
- [ ] At least 2GB free disk space
- [ ] Internet connection for downloading dependencies
- [ ] Ports 8000, 5432, 5050 available

---

## 🔍 Verification Steps

### Step 1: Verify File Structure

Check that all necessary files are present:

```
DMS/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── schemas/
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   └── USER_STORIES.md
├── docker-compose.yml
├── README.md
└── start.sh / start.bat
```

**✅ Expected**: All directories and key files are present  
**❌ If missing**: Re-clone the repository or check extraction

---

### Step 2: Start the System

#### Using Docker (Recommended)

```bash
# Start services
docker-compose up -d

# Check if containers are running
docker-compose ps
```

**✅ Expected Output**:
```
NAME                COMMAND                  STATUS              PORTS
dms_backend         "sh -c 'echo Wait…"      Up 30 seconds       0.0.0.0:8000->8000/tcp
dms_postgres        "docker-entrypoint.s…"   Up 30 seconds       0.0.0.0:5432->5432/tcp
dms_pgadmin         "/entrypoint.sh"         Up 30 seconds       0.0.0.0:5050->80/tcp
```

**❌ If containers not running**:
- Check logs: `docker-compose logs backend`
- Verify ports are available
- Ensure Docker Desktop is running

#### Using Manual Setup

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python scripts/init_db.py
uvicorn app.main:app --reload
```

**✅ Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

---

### Step 3: Verify API Health

**Test the health endpoint:**

```bash
curl http://localhost:8000/health
```

**✅ Expected Response**:
```json
{
  "status": "healthy"
}
```

**Or open in browser**: http://localhost:8000/health

---

### Step 4: Verify API Documentation

**Open in browser**: http://localhost:8000/api/docs

**✅ Expected**:
- Swagger UI loads successfully
- Shows authentication and user management endpoints
- "Authorize" button is visible

**❌ If not loading**:
- Check backend logs
- Verify port 8000 is not blocked
- Try http://127.0.0.1:8000/api/docs

---

### Step 5: Test Authentication

#### Via Swagger UI

1. Open http://localhost:8000/api/docs
2. Scroll to **POST /api/v1/auth/login**
3. Click "Try it out"
4. Enter credentials:
   ```json
   {
     "username": "admin",
     "password": "Admin@123456"
   }
   ```
5. Click "Execute"

**✅ Expected Response**: `200 OK` with access token

#### Via cURL

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@123456"}'
```

**✅ Expected Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

---

### Step 6: Test User Management

#### Authorize in Swagger UI

1. Copy the `access_token` from login response
2. Click "Authorize" button (top right)
3. Paste token in the value field
4. Click "Authorize"

**✅ Expected**: Green lock icon appears, showing "Authorized"

#### Create a Test User

1. Scroll to **POST /api/v1/users**
2. Click "Try it out"
3. Enter test user data:
   ```json
   {
     "username": "testuser",
     "email": "testuser@pharma.com",
     "password": "Test@123",
     "first_name": "Test",
     "last_name": "User",
     "department": "Quality",
     "role_ids": [1]
   }
   ```
4. Click "Execute"

**✅ Expected Response**: `201 Created` with user details

#### List Users

1. Go to **GET /api/v1/users**
2. Click "Try it out"
3. Click "Execute"

**✅ Expected Response**: `200 OK` with list containing at least 2 users (admin + testuser)

---

### Step 7: Test Role-Based Access Control

#### Test Non-Admin Access Restriction

1. **Logout** (clear authorization in Swagger)
2. **Login as testuser**:
   ```json
   {
     "username": "testuser",
     "password": "Test@123"
   }
   ```
3. Copy new access token and authorize
4. Try **GET /api/v1/users**

**✅ Expected Response**: `403 Forbidden` (testuser is Author, not Admin)

This confirms RBAC is working correctly!

---

### Step 8: Verify Audit Logging

1. **Re-authorize as admin**
2. Go to **GET /api/v1/audit-logs**
3. Click "Try it out"
4. Click "Execute"

**✅ Expected Response**: List of audit logs including:
- `USER_CREATED` for testuser
- `USER_LOGIN` events
- Timestamps, IP addresses, user agents

---

### Step 9: Test Database Connection

#### Using Docker

```bash
# Access PostgreSQL
docker exec -it dms_postgres psql -U dms_user -d dms_db

# List tables
\dt

# Count users
SELECT COUNT(*) FROM users;

# Exit
\q
```

**✅ Expected**: 
- Tables exist: users, roles, user_roles, audit_logs
- At least 2 users in database

#### Using pgAdmin

1. Open http://localhost:5050
2. Login: `admin@pharma-dms.com` / `admin`
3. Add server:
   - Name: DMS
   - Host: postgres
   - Port: 5432
   - Database: dms_db
   - Username: dms_user
   - Password: dms_password
4. Browse tables

**✅ Expected**: All tables visible with data

---

### Step 10: Run Automated Tests

```bash
cd backend
pytest

# Or with coverage
pytest --cov=app
```

**✅ Expected Output**:
```
===== test session starts =====
collected X items

tests/test_auth.py ......     [100%]
tests/test_users.py ......    [100%]

===== X passed in X.XXs =====
```

---

## 🎯 Verification Checklist

After completing all steps, verify:

- [ ] All Docker containers are running (or manual setup successful)
- [ ] Health endpoint returns healthy status
- [ ] API documentation loads at /api/docs
- [ ] Admin login successful
- [ ] Can create new users
- [ ] Can list users
- [ ] RBAC restricts non-admin access
- [ ] Audit logs are being created
- [ ] Database contains expected data
- [ ] Tests pass (if running automated tests)

---

## 🐛 Common Issues and Solutions

### Issue: Port Already in Use

**Error**: `bind: address already in use`

**Solution**:
```bash
# Stop conflicting services
docker-compose down

# Or change port in docker-compose.yml
```

### Issue: Database Connection Failed

**Error**: `could not connect to server`

**Solution**:
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Wait 10 seconds and try again
```

### Issue: Authentication Failed

**Error**: `401 Unauthorized`

**Solution**:
- Verify username/password are correct
- Check if user is active
- Ensure token hasn't expired
- Re-login to get fresh token

### Issue: Permission Denied

**Error**: `403 Forbidden`

**Solution**:
- Verify user has correct role
- User management requires DMS_Admin role
- Re-check authorization token

### Issue: Import Errors

**Error**: `ModuleNotFoundError`

**Solution**:
```bash
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📊 Performance Benchmarks

Expected performance (on typical development machine):

| Operation | Expected Time |
|-----------|---------------|
| System startup | < 30 seconds |
| Login request | < 200ms |
| Create user | < 500ms |
| List users (50 items) | < 300ms |
| Audit log query | < 400ms |

If significantly slower, check:
- Database connection
- Available system resources
- Network latency

---

## ✅ Success Criteria

Your installation is **successful** if:

1. ✅ All containers/services are running
2. ✅ API documentation is accessible
3. ✅ Admin can login and receive token
4. ✅ Admin can create, list, and manage users
5. ✅ Non-admin users cannot access admin endpoints
6. ✅ All actions are logged in audit trail
7. ✅ Database contains expected tables and data

---

## 🎉 Next Steps

After successful verification:

1. **Change admin password** immediately
2. **Create additional test users** with different roles
3. **Explore all API endpoints** in Swagger UI
4. **Review audit logs** for compliance
5. **Read documentation** in `/docs` folder
6. **Start planning Phase 2** (Document Management)

---

## 🆘 Getting Help

If verification fails:

1. **Check logs**: `docker-compose logs backend`
2. **Review documentation**: [docs/SETUP.md](docs/SETUP.md)
3. **Search for errors**: Copy error message and search in documentation
4. **Check environment**: Ensure all prerequisites are met
5. **Reset and retry**: `docker-compose down -v && docker-compose up -d`

---

## 📝 Report Template

If you need to report an issue, include:

```
**Environment**:
- OS: [Windows 10 / macOS / Linux]
- Docker version: [20.10.x]
- Python version: [3.11.x] (if manual setup)

**Issue**:
[Describe the problem]

**Steps to reproduce**:
1. [First step]
2. [Second step]
3. [etc.]

**Expected behavior**:
[What you expected to happen]

**Actual behavior**:
[What actually happened]

**Logs**:
```
[Paste relevant logs here]
```

**Screenshots** (if applicable):
[Attach screenshots]
```

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Production-Ready


