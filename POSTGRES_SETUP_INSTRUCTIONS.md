# Quick PostgreSQL 18 Setup Instructions

## ✅ Configuration Complete!

I've configured the system for your PostgreSQL 18 instance with:
- **Username**: postgres
- **Password**: Nsairaju@7
- **Port**: 5433
- **Database**: dms_db (needs to be created)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create the `.env` File

```bash
cd backend

# Copy the prepared configuration
copy env_postgres18.txt .env
# OR on Linux/Mac: cp env_postgres18.txt .env
```

The configuration file is ready at `backend/env_postgres18.txt`

### Step 2: Create the Database

Open Command Prompt or PowerShell and run:

```bash
# Connect to PostgreSQL
psql -U postgres -p 5433

# Enter password when prompted: Nsairaju@7
```

Then execute:

```sql
CREATE DATABASE dms_db;
GRANT ALL PRIVILEGES ON DATABASE dms_db TO postgres;
\c dms_db
GRANT ALL ON SCHEMA public TO postgres;
\q
```

**OR use the provided SQL script:**

```bash
psql -U postgres -p 5433 -f setup_database.sql
```

### Step 3: Initialize Database Tables

```bash
cd backend

# If using virtual environment, activate it first:
# venv\Scripts\activate  (Windows)
# source venv/bin/activate  (Linux/Mac)

# Install dependencies (if not done)
pip install -r requirements.txt

# Initialize database
python scripts/init_db.py
```

**Expected Output:**
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
============================================================
```

---

## 🎯 Start the Application

```bash
cd backend

# Option 1: Using uvicorn
uvicorn app.main:app --reload

# Option 2: Using run script
python run.py
```

**Access the application:**
- API Docs: http://localhost:8000/api/docs
- Health Check: http://localhost:8000/health

**Login:**
- Username: `admin`
- Password: `Admin@123456`

---

## 🔍 Verify Everything is Working

### Test Database Connection

```bash
psql -U postgres -p 5433 -d dms_db -c "\dt"
```

**Expected tables:**
- audit_logs
- roles
- user_roles
- users

### Test Application Login

1. Open http://localhost:8000/api/docs
2. Click "Authorize" button
3. Enter:
   - Username: admin
   - Password: Admin@123456
4. Click "Login"
5. You should receive an access token!

---

## 📁 Files Created/Updated

1. **`backend/env_postgres18.txt`** - Your PostgreSQL configuration
   - Copy this to `backend/.env`

2. **`setup_database.sql`** - SQL script to create database
   - Run with: `psql -U postgres -p 5433 -f setup_database.sql`

3. **`SETUP_POSTGRESQL.md`** - Complete troubleshooting guide
   - Detailed instructions and solutions

---

## ⚠️ Important Notes

1. **Password with Special Character**: Your password `Nsairaju@7` contains `@` which is properly escaped in the connection string.

2. **Port 5433**: This is a non-standard port (default is 5432). Make sure PostgreSQL is actually listening on 5433.

3. **Check PostgreSQL is Running**:
   ```bash
   # Windows
   sc query postgresql-18
   
   # Linux
   sudo systemctl status postgresql
   ```

4. **Firewall**: Ensure port 5433 is not blocked by firewall.

---

## 🆘 Troubleshooting

### Can't Connect to PostgreSQL?

```bash
# Check if PostgreSQL is running on port 5433
netstat -an | findstr 5433

# Or test connection
psql -U postgres -h localhost -p 5433 -c "SELECT version();"
```

### "Database does not exist" Error?

Run Step 2 again to create the database.

### "Permission denied" Error?

```sql
psql -U postgres -p 5433 -d dms_db
GRANT ALL ON SCHEMA public TO postgres;
\q
```

### Connection String Issues?

The connection string in `.env` should be:
```
DATABASE_URL="postgresql://postgres:Nsairaju@7@localhost:5433/dms_db"
```

---

## ✅ Success Checklist

- [ ] Copied `env_postgres18.txt` to `.env`
- [ ] Created database `dms_db` in PostgreSQL
- [ ] Ran `python scripts/init_db.py` successfully
- [ ] Started application with `uvicorn app.main:app --reload`
- [ ] Can access http://localhost:8000/api/docs
- [ ] Successfully logged in as admin
- [ ] Can create test users

---

## 🎉 You're All Set!

If all steps completed successfully, your Pharma DMS is now running with PostgreSQL 18!

**Next Steps:**
1. Change the admin password immediately
2. Create test users with different roles
3. Explore the API endpoints
4. Review the documentation in `/docs`

For detailed troubleshooting, see: **SETUP_POSTGRESQL.md**

---

**Need Help?** Check the detailed guide in `SETUP_POSTGRESQL.md` for complete troubleshooting and advanced configuration options.


