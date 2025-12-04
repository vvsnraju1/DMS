# PostgreSQL 18 Setup Guide

Complete guide to set up and configure PostgreSQL 18 for Pharma DMS.

---

## 📋 Your Configuration

- **PostgreSQL Version**: 18
- **Username**: postgres
- **Password**: Nsairaju@7
- **Port**: 5433
- **Database**: dms_db (will be created)

---

## 🚀 Quick Setup Steps

### Step 1: Create Database

Open your terminal/command prompt and run:

```bash
# Connect to PostgreSQL
psql -U postgres -p 5433

# You'll be prompted for password: Nsairaju@7
```

Then execute these SQL commands:

```sql
-- Create the database
CREATE DATABASE dms_db;

-- Verify it was created
\l

-- Connect to the new database
\c dms_db

-- Grant all privileges
GRANT ALL ON SCHEMA public TO postgres;

-- Exit
\q
```

### Step 2: Verify Configuration File

The configuration file has been created at `backend/.env` with your PostgreSQL details:

```bash
DATABASE_URL="postgresql://postgres:Nsairaju@7@localhost:5433/dms_db"
```

### Step 3: Initialize Database Tables

```bash
cd backend

# Activate virtual environment (if using manual setup)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies (if not already done)
pip install -r requirements.txt

# Initialize database with tables and seed data
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
  Username: admin
  Email: admin@pharma-dms.com
  Password: Admin@123456
  ⚠️  IMPORTANT: Change the admin password after first login!

============================================================
✓ Database initialization completed successfully!
============================================================
```

### Step 4: Start the Application

```bash
# Make sure you're in the backend directory
cd backend

# Start the server
uvicorn app.main:app --reload
```

**Or use the run script:**
```bash
python run.py
```

### Step 5: Verify Connection

Open your browser and go to:
- **API Docs**: http://localhost:8000/api/docs
- **Health Check**: http://localhost:8000/health

---

## 🔍 Verification Commands

### Check if Database Exists

```bash
psql -U postgres -p 5433 -c "\l" | grep dms_db
```

### Check Tables

```bash
psql -U postgres -p 5433 -d dms_db -c "\dt"
```

**Expected tables:**
- users
- roles
- user_roles
- audit_logs

### Count Records

```bash
# Count users
psql -U postgres -p 5433 -d dms_db -c "SELECT COUNT(*) FROM users;"

# Count roles
psql -U postgres -p 5433 -d dms_db -c "SELECT COUNT(*) FROM roles;"

# Count audit logs
psql -U postgres -p 5433 -d dms_db -c "SELECT COUNT(*) FROM audit_logs;"
```

### View Admin User

```bash
psql -U postgres -p 5433 -d dms_db -c "SELECT id, username, email, is_active FROM users WHERE username='admin';"
```

---

## 🐳 Docker Setup (Alternative)

If you want to use Docker but connect to your existing PostgreSQL:

### Update docker-compose.yml

Comment out the postgres service and update backend service:

```yaml
services:
  # postgres:  # Comment out this entire section
  #   image: postgres:15-alpine
  #   ...

  backend:
    build:
      context: ./backend
    container_name: dms_backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://postgres:Nsairaju@7@host.docker.internal:5433/dms_db
    # ... rest of config
```

**Note**: Use `host.docker.internal` instead of `localhost` when connecting from Docker to host machine.

---

## 🔧 Troubleshooting

### Issue: Connection Refused

**Error**: `psql: error: connection to server at "localhost" (127.0.0.1), port 5433 failed`

**Solutions:**

1. **Check if PostgreSQL is running:**
   ```bash
   # Windows
   sc query postgresql-18
   
   # Linux
   sudo systemctl status postgresql
   
   # Mac
   brew services list | grep postgresql
   ```

2. **Start PostgreSQL if stopped:**
   ```bash
   # Windows (as Administrator)
   net start postgresql-18
   
   # Linux
   sudo systemctl start postgresql
   
   # Mac
   brew services start postgresql@18
   ```

3. **Verify port 5433 is listening:**
   ```bash
   # Windows
   netstat -an | findstr 5433
   
   # Linux/Mac
   netstat -an | grep 5433
   ```

### Issue: Authentication Failed

**Error**: `psql: error: FATAL: password authentication failed`

**Solutions:**

1. **Verify password is correct**: `Nsairaju@7`

2. **Check pg_hba.conf** authentication method:
   ```bash
   # Find pg_hba.conf location
   psql -U postgres -p 5433 -c "SHOW hba_file;"
   
   # Edit and ensure you have:
   # host    all    all    127.0.0.1/32    md5
   ```

3. **Reload PostgreSQL after changes:**
   ```bash
   # Windows (as Administrator)
   net stop postgresql-18
   net start postgresql-18
   
   # Linux
   sudo systemctl reload postgresql
   ```

### Issue: Database Already Exists

**Error**: `database "dms_db" already exists`

**Solution**: Drop and recreate (⚠️ **this deletes all data**):

```sql
-- Connect to postgres database
psql -U postgres -p 5433 -d postgres

-- Drop existing database
DROP DATABASE dms_db;

-- Create new database
CREATE DATABASE dms_db;

-- Exit and reinitialize
\q
```

Then run `python scripts/init_db.py` again.

### Issue: Permission Denied

**Error**: `ERROR: permission denied for schema public`

**Solution**:
```sql
-- Connect to dms_db
psql -U postgres -p 5433 -d dms_db

-- Grant all privileges
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

\q
```

### Issue: Python Connection Error

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:

1. **Verify .env file** in `backend/.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:Nsairaju@7@localhost:5433/dms_db"
   ```

2. **Test connection with Python**:
   ```bash
   cd backend
   python -c "from app.database import engine; print('Connected!', engine.url)"
   ```

3. **Check if password has special characters** - it does! Make sure it's properly quoted in connection string.

---

## 📊 Database Management Tools

### Using pgAdmin

1. **Open pgAdmin** (if installed)
2. **Add New Server**:
   - Name: Pharma DMS
   - Host: localhost
   - Port: 5433
   - Database: dms_db
   - Username: postgres
   - Password: Nsairaju@7

### Using DBeaver

1. **Create New Connection**
2. **Select PostgreSQL**
3. **Enter connection details**:
   - Host: localhost
   - Port: 5433
   - Database: dms_db
   - Username: postgres
   - Password: Nsairaju@7
4. **Test Connection**

### Using Command Line (psql)

```bash
# Connect to database
psql -U postgres -h localhost -p 5433 -d dms_db

# Useful commands:
\dt              # List tables
\d users         # Describe users table
\du              # List users/roles
SELECT version(); # Check PostgreSQL version
\q               # Quit
```

---

## 🔐 Security Recommendations

1. **Change Default Admin Password**
   - After first login, immediately change the DMS admin password

2. **Secure PostgreSQL Password**
   - Your current password `Nsairaju@7` is reasonably strong
   - Consider using environment-specific passwords (dev vs prod)

3. **Restrict Network Access**
   - If production, configure pg_hba.conf to only allow specific IPs
   - Use SSL/TLS for remote connections

4. **Regular Backups**
   ```bash
   # Create backup
   pg_dump -U postgres -p 5433 -d dms_db > backup_$(date +%Y%m%d).sql
   
   # Restore backup
   psql -U postgres -p 5433 -d dms_db < backup_20240115.sql
   ```

---

## ✅ Success Checklist

After setup, verify:

- [ ] PostgreSQL 18 is running on port 5433
- [ ] Database `dms_db` is created
- [ ] Can connect with `psql -U postgres -p 5433 -d dms_db`
- [ ] Tables are created (users, roles, user_roles, audit_logs)
- [ ] Initial roles are seeded (4 roles)
- [ ] Admin user is created
- [ ] Application starts without errors
- [ ] Can login at http://localhost:8000/api/docs
- [ ] Can create test users
- [ ] Audit logs are being recorded

---

## 🎯 Next Steps

1. **Start the application**:
   ```bash
   cd backend
   python run.py
   ```

2. **Access API Documentation**:
   http://localhost:8000/api/docs

3. **Login with admin credentials**:
   - Username: admin
   - Password: Admin@123456

4. **Change admin password immediately**

5. **Create test users with different roles**

6. **Explore the API endpoints**

---

## 📞 Quick Reference

**Connection String:**
```
postgresql://postgres:Nsairaju@7@localhost:5433/dms_db
```

**Connection Details:**
- Host: localhost
- Port: 5433
- Database: dms_db
- Username: postgres
- Password: Nsairaju@7

**Files Updated:**
- `backend/.env` - Configuration file with database URL
- `setup_database.sql` - SQL script to create database

---

**Ready to go!** Follow the Quick Setup Steps above to get started. 🚀


