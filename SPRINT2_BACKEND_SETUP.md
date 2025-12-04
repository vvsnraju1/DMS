# Sprint 2 Backend Setup & Testing Guide

## 🎉 Backend Implementation Complete!

All backend components for Sprint 2 are now implemented and ready to test.

---

## ✅ What's Been Implemented

### **Database Models**
- ✅ `Document` - Master document with metadata
- ✅ `DocumentVersion` - Versioned content with workflow
- ✅ `Attachment` - File uploads with checksums
- ✅ `EditLock` - Concurrent editing locks

### **API Endpoints**

#### **Documents** (`/api/v1/documents`)
- `POST /documents` - Create document (URS-DVM-001)
- `GET /documents` - List/search documents (URS-DVM-011)
- `GET /documents/{id}` - Get document details
- `PATCH /documents/{id}` - Update document metadata
- `DELETE /documents/{id}` - Soft delete document

#### **Document Versions** (`/api/v1/documents/{doc_id}/versions`)
- `POST /{doc_id}/versions` - Create new version (URS-DVM-002)
- `GET /{doc_id}/versions` - List all versions
- `GET /{doc_id}/versions/{vid}` - Get version details
- `PATCH /{doc_id}/versions/{vid}` - Update draft metadata (URS-DVM-003)
- `POST /{doc_id}/versions/{vid}/save` - Save content (URS-DVM-005)

#### **Edit Locks** (`/api/v1/documents/{doc_id}/versions/{vid}/lock`)
- `POST /{doc_id}/versions/{vid}/lock` - Acquire lock (URS-DVM-006)
- `GET /{doc_id}/versions/{vid}/lock` - Check lock status
- `POST /{doc_id}/versions/{vid}/lock/heartbeat` - Refresh lock
- `DELETE /{doc_id}/versions/{vid}/lock` - Release lock

#### **Attachments** (`/api/v1/attachments`)
- `POST /attachments` - Upload file (URS-DVM-007)
- `GET /attachments/{id}` - Get metadata
- `GET /attachments/{id}/download` - Download file
- `DELETE /attachments/{id}` - Delete attachment
- `GET /attachments/document/{doc_id}/list` - List document attachments

### **Features**
- ✅ Auto-generated document numbers (SOP-DEPT-YYYYMMDD-NNNN)
- ✅ Auto-increment version numbers
- ✅ Content hash computation (SHA-256) for optimistic locking
- ✅ Edit locking with expiry and heartbeat
- ✅ File upload with checksum deduplication
- ✅ RBAC enforcement (Author/Reviewer/Approver/Admin)
- ✅ Comprehensive audit logging
- ✅ Soft deletes for documents and attachments

---

## 🚀 Setup Instructions

### **Step 1: Install New Dependency**

```bash
cd backend
pip install aiofiles==23.2.1
```

Or reinstall all requirements:
```bash
pip install -r requirements.txt
```

### **Step 2: Run Database Migration**

```bash
# Make sure you're in the backend directory
cd backend

# Run the migration
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade 001_initial_schema -> 002_document_models
```

### **Step 3: Verify Tables Created**

```bash
psql -U postgres -p 5433 -d dms_db
```

```sql
-- List all tables
\dt

-- Should see:
-- documents
-- document_versions
-- attachments
-- edit_locks

-- Check documents table
\d documents

-- Check version status enum
SELECT enum_range(NULL::versionstatus);

-- Exit
\q
```

### **Step 4: Restart Backend**

```bash
cd backend
python run.py
```

Expected output:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🧪 Testing the APIs

### **Option 1: OpenAPI Docs (Recommended)**

1. Open http://localhost:8000/docs
2. Click **"Authorize"** button
3. Login with admin credentials: `admin` / `Admin@123456`
4. Copy the `access_token`
5. Click **"Authorize"** again and paste token with `Bearer ` prefix
6. Now test all endpoints!

### **Option 2: cURL Commands**

#### **1. Login to get token**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123456"
  }'
```

Save the `access_token` from response.

#### **2. Create a Document**
```bash
TOKEN="your_access_token_here"

curl -X POST "http://localhost:8000/api/v1/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quality Management Standard Operating Procedure",
    "description": "This SOP defines the quality management process",
    "department": "Quality Assurance",
    "tags": ["QA", "Quality", "Process"]
  }'
```

Response includes auto-generated `document_number` like `SOP-QUAL-20251129-0001`.

#### **3. Create a Version**
```bash
DOC_ID=1  # Use ID from previous response

curl -X POST "http://localhost:8000/api/v1/documents/$DOC_ID/versions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_html": "<h1>SOP Title</h1><p>This is the content...</p>",
    "change_summary": "Initial version"
  }'
```

#### **4. Acquire Edit Lock**
```bash
DOC_ID=1
VERSION_ID=1  # Use ID from previous response

curl -X POST "http://localhost:8000/api/v1/documents/$DOC_ID/versions/$VERSION_ID/lock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeout_minutes": 30,
    "session_id": "test-session-123"
  }'
```

Save the `lock_token` from response.

#### **5. Save Content**
```bash
LOCK_TOKEN="your_lock_token_here"

curl -X POST "http://localhost:8000/api/v1/documents/$DOC_ID/versions/$VERSION_ID/save" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_html": "<h1>Updated Title</h1><p>Updated content...</p>",
    "lock_token": "'$LOCK_TOKEN'",
    "is_autosave": false
  }'
```

#### **6. Upload Attachment**
```bash
curl -X POST "http://localhost:8000/api/v1/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "description=Supporting document" \
  -F "document_id=$DOC_ID"
```

#### **7. List Documents**
```bash
curl -X GET "http://localhost:8000/api/v1/documents?page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN"
```

#### **8. Check Audit Logs**
```bash
curl -X GET "http://localhost:8000/api/v1/audit-logs?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 Verification Checklist

### **Database**
- [ ] All new tables created (documents, document_versions, attachments, edit_locks)
- [ ] Foreign keys properly set up
- [ ] Indexes created
- [ ] Enum type for version status exists

### **API Functionality**
- [ ] Can create document → returns 201 with auto-generated document_number
- [ ] Can list documents → returns paginated results
- [ ] Can create version → version_number auto-increments
- [ ] Can save version content → content_hash computed
- [ ] Can acquire lock → lock_token returned
- [ ] Second user cannot acquire same lock → returns 423
- [ ] Lock heartbeat extends expiry
- [ ] Can release lock
- [ ] Can upload attachment → file saved to storage/attachments
- [ ] Can download attachment → file returned
- [ ] Audit logs created for all actions

### **RBAC**
- [ ] Non-Author cannot create documents → returns 403
- [ ] Non-owner cannot edit document → returns 403
- [ ] Cannot edit non-draft version → returns 403
- [ ] Admin can edit any document → returns 200

### **Concurrency**
- [ ] Optimistic locking works → stale content_hash returns 409
- [ ] Edit lock prevents concurrent saves → returns 403
- [ ] Expired locks can be reacquired

---

## 📊 Database Schema

```
documents
├── id (PK)
├── document_number (unique, indexed)
├── title (indexed)
├── description
├── department (indexed)
├── tags (JSON array)
├── owner_id (FK → users)
├── created_by_id (FK → users)
├── current_version_id (FK → document_versions)
├── status (indexed)
└── timestamps

document_versions
├── id (PK)
├── document_id (FK → documents, indexed)
├── version_number
├── content_html
├── content_hash (SHA-256)
├── change_summary
├── status (enum, indexed)
├── attachments_metadata (JSON)
├── workflow fields (submitted_at, reviewed_at, approved_at, etc.)
├── lock_version (optimistic locking counter)
└── timestamps

attachments
├── id (PK)
├── filename
├── original_filename
├── mime_type
├── file_size
├── storage_path
├── checksum_sha256
├── document_id (FK, indexed)
├── document_version_id (FK, indexed)
├── uploaded_by_id (FK → users)
└── timestamps

edit_locks
├── id (PK)
├── document_version_id (FK, unique, indexed)
├── user_id (FK → users)
├── lock_token (unique, indexed)
├── acquired_at
├── expires_at (indexed)
├── last_heartbeat
└── session_id
```

---

## 🎯 Next Steps

### **Backend - Optional Enhancements**
- [ ] DOCX export endpoint (server-side conversion)
- [ ] Lock cleanup background task (remove expired locks)
- [ ] Virus scanning integration for attachments
- [ ] Workflow endpoints (submit, review, approve, reject, publish)
- [ ] Advanced search with full-text indexing

### **Frontend - Now Ready to Implement**
- [ ] Install Syncfusion packages
- [ ] Create documents list page
- [ ] Create document editor with Syncfusion DocumentEditor
- [ ] Implement autosave (10s interval)
- [ ] Implement lock heartbeat (15s interval)
- [ ] Add conflict resolution UI
- [ ] Add attachment upload/download UI
- [ ] Add DOCX import/export buttons

---

## 🐛 Troubleshooting

### **Migration Fails**
```bash
# Reset migrations (CAUTION: drops all data)
alembic downgrade base
alembic upgrade head
```

### **Import Errors**
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### **File Upload Fails**
- Check `storage/attachments` directory exists and is writable
- Check `MAX_FILE_SIZE` in `attachments.py` (default 100MB)

### **Lock Token Invalid**
- Locks expire after 30 minutes by default
- Frontend must call heartbeat every 10-15 seconds
- Use lock status endpoint to check before saving

---

## 📝 API Quick Reference

| Endpoint | Method | Purpose | RBAC |
|----------|--------|---------|------|
| `/documents` | POST | Create document | Author/Admin |
| `/documents` | GET | List documents | All |
| `/documents/{id}` | GET | Get details | All |
| `/documents/{id}` | PATCH | Update metadata | Owner/Admin |
| `/documents/{id}/versions` | POST | Create version | Owner/Admin |
| `/documents/{id}/versions/{vid}` | GET | Get version | All |
| `/documents/{id}/versions/{vid}/save` | POST | Save content | Owner/Admin + Lock |
| `/documents/{id}/versions/{vid}/lock` | POST | Acquire lock | Owner/Admin |
| `/documents/{id}/versions/{vid}/lock` | GET | Check lock | All |
| `/documents/{id}/versions/{vid}/lock/heartbeat` | POST | Refresh lock | Lock owner |
| `/documents/{id}/versions/{vid}/lock` | DELETE | Release lock | Lock owner/Admin |
| `/attachments` | POST | Upload file | All authenticated |
| `/attachments/{id}/download` | GET | Download file | All |

---

## 🎉 Backend Complete - Ready for Frontend!

**Backend Progress: 100% ✅**

All 8 backend TODOs completed:
1. ✅ Models created
2. ✅ Migration created
3. ✅ Schemas created
4. ✅ Document CRUD implemented
5. ✅ Version management implemented
6. ✅ Edit locking implemented
7. ✅ Attachments implemented
8. ✅ Audit logging integrated

**Next Phase: Frontend Implementation**

Ready to build the React frontend with Syncfusion DocumentEditor integration!


