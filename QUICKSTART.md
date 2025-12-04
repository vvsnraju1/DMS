# Quick Start Guide

Get Pharma DMS running in **5 minutes**!

## 🚀 Fastest Way: Docker

### 1. Prerequisites

- Docker Desktop installed ([Get Docker](https://docs.docker.com/get-docker/))

### 2. Start the System

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

Or manually:
```bash
docker-compose up -d
```

### 3. Access the System

**API Documentation (Swagger):**  
http://localhost:8000/api/docs

**Login Credentials:**
- Username: `admin`
- Password: `Admin@123456`

### 4. First Steps

1. Open http://localhost:8000/api/docs
2. Click **"Authorize"** button (top right)
3. Login with admin credentials
4. Try the endpoints!

---

## 🐍 Alternative: Python Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
python scripts/init_db.py
```

### 3. Start Server

```bash
uvicorn app.main:app --reload
```

Or:
```bash
python run.py
```

### 4. Access System

Open http://localhost:8000/api/docs

---

## 📋 What to Try

### Create a User (Admin)

1. **Authorize** with admin token
2. **POST /api/v1/users** endpoint
3. Use this example:

```json
{
  "username": "author1",
  "email": "author1@pharma.com",
  "password": "Author@123",
  "first_name": "John",
  "last_name": "Doe",
  "department": "Quality",
  "role_ids": [1]
}
```

### View Audit Logs

1. **GET /api/v1/audit-logs**
2. See all tracked actions
3. Filter by action type, date, user

### Test Role-Based Access

1. **Logout admin**
2. **Login as author1**
3. Try to access **GET /api/v1/users** (should fail - not admin!)

---

## 🎯 Available Roles

### Role IDs
- **1** - Author
- **2** - Reviewer  
- **3** - Approver
- **4** - DMS_Admin

### Role Descriptions

**Author (1)**
- Create and edit documents
- Submit for review

**Reviewer (2)**
- Review documents
- Add comments

**Approver (3)**
- Approve/reject documents
- E-sign documents

**DMS_Admin (4)**
- Full user management
- All system access

---

## 🔐 Security Note

⚠️ **Change the default admin password immediately!**

Use the **POST /api/v1/users/{user_id}/reset-password** endpoint.

---

## 📚 Learn More

- **Full Documentation**: [README.md](README.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Setup Guide**: [docs/SETUP.md](docs/SETUP.md)
- **User Stories**: [docs/USER_STORIES.md](docs/USER_STORIES.md)

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Stop existing services
docker-compose down

# Or change port in docker-compose.yml
```

### Database Issues
```bash
# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d
```

### Can't Login
- Check username/password
- Ensure user is active
- Check token hasn't expired

---

## 🎉 You're Ready!

The system is now running with:
- ✅ User authentication
- ✅ Role-based access control
- ✅ Complete audit logging
- ✅ Admin user management
- ✅ FDA 21 CFR Part 11 ready architecture

**Next Phase**: Document management features coming soon!

