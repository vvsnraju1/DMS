# Pharma Document Management System (DMS)

A comprehensive Document Management System designed for pharmaceutical companies, implementing controlled SOP lifecycle management and role-based access control (RBAC) with FDA 21 CFR Part 11 compliance considerations.

## 🎯 Project Overview

This system provides a complete solution for managing controlled documents in pharmaceutical environments with:

- **Role-Based Access Control (RBAC)** with four distinct roles
- **Controlled Document Lifecycle** (Draft → Review → Approval → Published → Archived)
- **Comprehensive Audit Trail** for regulatory compliance
- **E-Signature Support** for document approval
- **Version Control** with rollback capabilities
- **FDA 21 CFR Part 11 Ready** architecture

## 📋 Phase 1: User Management and RBAC ✅

**Status:** Complete and Production-Ready

This initial phase implements the foundational user management and authentication system:

### Features Implemented

✅ **User Authentication**
- Secure login with JWT tokens
- Password hashing with bcrypt
- Session management
- Admin-only password reset

✅ **User Management (Admin Only)**
- Create, read, update, delete users
- Activate/deactivate user accounts
- Assign multiple roles per user
- Reset passwords with optional force-change

✅ **Role-Based Access Control**
- Four roles: Author, Reviewer, Approver, DMS_Admin
- Permission-based access control
- Role inheritance support

✅ **Audit Logging**
- Complete audit trail for all user actions
- Records user, timestamp, IP address, user agent
- Searchable and filterable logs
- Regulatory compliance ready

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Python 3.11+
- FastAPI (Modern, high-performance web framework)
- SQLAlchemy (ORM)
- Alembic (Database migrations)
- PostgreSQL (Primary database)
- JWT (Authentication)
- Bcrypt (Password hashing)

**DevOps:**
- Docker & Docker Compose
- PostgreSQL 15
- pgAdmin (Database management UI)

### Project Structure

```
DMS/
├── backend/
│   ├── alembic/                 # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── api/                 # API endpoints
│   │   │   ├── v1/
│   │   │   │   ├── auth.py      # Authentication endpoints
│   │   │   │   ├── users.py     # User management endpoints
│   │   │   │   └── audit_logs.py # Audit log endpoints
│   │   │   └── deps.py          # API dependencies
│   │   ├── core/                # Core utilities
│   │   │   ├── security.py      # Password & JWT handling
│   │   │   ├── rbac.py          # Role-based access control
│   │   │   └── audit.py         # Audit logging
│   │   ├── models/              # Database models
│   │   │   ├── user.py
│   │   │   ├── role.py
│   │   │   └── audit_log.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── auth.py
│   │   │   └── audit_log.py
│   │   ├── config.py            # Application configuration
│   │   ├── database.py          # Database connection
│   │   └── main.py              # FastAPI application
│   ├── scripts/
│   │   ├── init_db.py           # Database initialization
│   │   └── reset_db.py          # Database reset
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic.ini
├── docs/
│   ├── USER_STORIES.md          # Detailed user stories
│   ├── API.md                   # API documentation
│   └── SETUP.md                 # Setup instructions
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- OR Python 3.11+ and PostgreSQL 15+

### Option 1: Docker Compose (Recommended)

1. **Clone the repository:**
```bash
git clone <repository-url>
cd DMS
```

2. **Start the services:**
```bash
docker-compose up -d
```

3. **Access the application:**
- API Documentation: http://localhost:8000/api/docs
- Backend API: http://localhost:8000
- pgAdmin: http://localhost:5050 (admin@pharma-dms.com / admin)

4. **Default Admin Credentials:**
- Username: `admin`
- Password: `Admin@123456`
- ⚠️ **Change this password immediately after first login!**

### Option 2: Manual Setup

1. **Create Python virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Create .env file:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize database:**
```bash
# Option A: Using SQLite (development only)
python scripts/init_db.py

# Option B: Using PostgreSQL
# 1. Start PostgreSQL
# 2. Update DATABASE_URL in .env
# 3. Run: python scripts/init_db.py
```

5. **Start the application:**
```bash
uvicorn app.main:app --reload
```

6. **Access API documentation:**
- http://localhost:8000/api/docs

## 📚 API Documentation

### Authentication Endpoints

**POST /api/v1/auth/login**
- Login with username and password
- Returns JWT access token

**GET /api/v1/auth/me**
- Get current user profile
- Requires authentication

### User Management Endpoints (Admin Only)

**POST /api/v1/users**
- Create new user with roles

**GET /api/v1/users**
- List all users with filtering and pagination

**GET /api/v1/users/{user_id}**
- Get user details

**PUT /api/v1/users/{user_id}**
- Update user information and roles

**PATCH /api/v1/users/{user_id}/activate**
- Activate user account

**PATCH /api/v1/users/{user_id}/deactivate**
- Deactivate user account

**POST /api/v1/users/{user_id}/reset-password**
- Reset user password (admin only)

**DELETE /api/v1/users/{user_id}**
- Delete user (consider deactivation instead)

### Audit Log Endpoints (Admin Only)

**GET /api/v1/audit-logs**
- Get audit logs with filtering and pagination

**GET /api/v1/audit-logs/actions**
- Get list of available action types

**GET /api/v1/audit-logs/entity-types**
- Get list of available entity types

## 🔐 Security Features

### Password Policy

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- Hashed using bcrypt

### Authentication

- JWT-based authentication
- Token expiration (default: 60 minutes)
- Secure password storage (bcrypt)
- No password exposure in logs or responses

### Authorization

- Role-based access control (RBAC)
- Permission-based API access
- Admin-only endpoints for user management
- Self-service profile viewing

### Audit Trail

- Every action logged with:
  - User ID and username
  - Action type
  - Entity type and ID
  - Description
  - Timestamp
  - IP address
  - User agent
- Immutable audit logs
- Searchable and filterable

## 👥 User Roles

### DMS_Admin
**Capabilities:**
- Full user management (create, update, delete, activate, deactivate)
- Reset user passwords
- Assign/modify roles
- View audit logs
- All document management permissions (future phase)

### Author
**Capabilities (Future Phase):**
- Create documents
- Edit own documents
- Submit documents for review
- Withdraw documents

### Reviewer
**Capabilities (Future Phase):**
- Review documents
- Add comments and suggestions
- Request changes

### Approver
**Capabilities (Future Phase):**
- Approve or reject documents
- E-sign documents
- Final approval authority

## 📊 User Stories Implemented

All Phase 1 user stories are fully implemented. See [docs/USER_STORIES.md](docs/USER_STORIES.md) for detailed mapping.

### Key User Stories

- ✅ US-1.1: Admin can create new users
- ✅ US-1.2: Admin can assign roles during user creation
- ✅ US-2.1: Admin can view all users
- ✅ US-2.2: Admin can filter users by role/status
- ✅ US-3.1: Admin can update user information
- ✅ US-3.2: Admin can modify user roles
- ✅ US-4.1: Admin can deactivate users
- ✅ US-4.2: Admin can reactivate users
- ✅ US-5.1: Users can log in securely
- ✅ US-5.2: Invalid credentials show error
- ✅ US-6.1: RBAC enforced at API level
- ✅ US-6.2: Role-based feature access
- ✅ US-7.1: Passwords hashed and secure
- ✅ US-7.2: Passwords never exposed
- ✅ US-8.1: Admin can reset passwords
- ✅ US-8.2: Password resets logged
- ✅ US-8.3: Force password change on reset
- ✅ US-9.1: Audit logs for compliance
- ✅ US-9.2: Admin actions logged
- ✅ US-10.1: Users can view own profile
- ✅ US-10.2: Admin can view any user profile

## 🧪 Testing

### Manual Testing with API Docs

1. Open http://localhost:8000/api/docs
2. Click "Authorize" button
3. Login with admin credentials
4. Try various endpoints

### Testing Workflow

1. **Login as Admin:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@123456"}'
```

2. **Create a User:**
```bash
curl -X POST "http://localhost:8000/api/v1/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "author1",
    "email": "author1@pharma.com",
    "password": "Author@123",
    "first_name": "John",
    "last_name": "Doe",
    "department": "Quality",
    "role_ids": [1]
  }'
```

3. **View Audit Logs:**
```bash
curl -X GET "http://localhost:8000/api/v1/audit-logs" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 Database Management

### Initialize Database
```bash
cd backend
python scripts/init_db.py
```

### Reset Database (⚠️ Deletes all data)
```bash
python scripts/reset_db.py
```

### Create Migration
```bash
alembic revision --autogenerate -m "Description"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

## 📈 Roadmap

### Phase 2: Document Management (Planned)
- Document creation and versioning
- Document templates
- Metadata management
- File upload and storage

### Phase 3: Workflow Management (Planned)
- Document lifecycle state machine
- Review workflow
- Approval workflow with e-signature
- Notifications and alerts

### Phase 4: Advanced Features (Planned)
- Document search and indexing
- Advanced reporting
- Document archival
- Compliance reporting
- Training records integration

## 🤝 Contributing

This is a production system for pharmaceutical document management. All contributions should:

1. Follow FDA 21 CFR Part 11 guidelines
2. Include comprehensive audit logging
3. Maintain security best practices
4. Include tests
5. Update documentation

## 📝 License

[Specify your license here]

## 🆘 Support

For issues, questions, or contributions:
1. Check the documentation in `/docs`
2. Review API documentation at `/api/docs`
3. Contact the development team

## ⚠️ Important Notes

1. **Security:**
   - Change default admin password immediately
   - Use strong SECRET_KEY in production
   - Enable HTTPS in production
   - Configure proper CORS origins

2. **Compliance:**
   - Audit logs are critical for compliance
   - Do not delete audit records
   - Regular backups required
   - Review security policies regularly

3. **Production Deployment:**
   - Use PostgreSQL (not SQLite)
   - Configure proper backups
   - Set up monitoring and alerting
   - Review and harden security settings
   - Use environment variables for secrets

## 🎉 Credits

Developed for pharmaceutical companies requiring FDA 21 CFR Part 11 compliant document management.

---

**Version:** 1.0.0  
**Status:** Phase 1 Complete ✅  
**Last Updated:** 2024


