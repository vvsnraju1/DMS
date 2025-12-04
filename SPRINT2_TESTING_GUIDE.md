# Sprint 2 - Complete Testing Guide

## 🎯 Testing Objectives

Verify all 12 URS requirements from Sprint 2 are working correctly.

---

## ✅ Pre-Testing Setup

### **1. Run Database Migration**
```bash
cd backend
alembic upgrade head
```

**Verify:**
```bash
psql -U postgres -p 5433 -d dms_db
```
```sql
-- Check new tables exist
\dt
-- You should see: documents, document_versions, attachments, edit_locks

-- Exit
\q
```

### **2. Start Backend**
```bash
cd backend
python run.py
```

**Should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### **3. Open API Docs**
Go to: http://localhost:8000/docs

### **4. Get Auth Token**
1. Click **"Authorize"** button (top right)
2. Login with: `admin` / `Admin@123456`
3. Copy the `access_token`
4. Click **"Authorize"** again
5. Paste token with `Bearer ` prefix: `Bearer YOUR_TOKEN_HERE`
6. Click **"Authorize"** to save

Now you can test all endpoints!

---

## 📋 Testing Checklist

### **Test 1: URS-DVM-001 - Create Document** ✓

**Endpoint:** `POST /api/v1/documents`

**Test Case 1.1: Create document with auto-generated number**
1. Expand `POST /documents` endpoint
2. Click **"Try it out"**
3. Paste this JSON:
```json
{
  "title": "Quality Management SOP",
  "description": "Standard Operating Procedure for Quality Management",
  "department": "Quality Assurance",
  "tags": ["QA", "Quality", "Process"]
}
```
4. Click **"Execute"**

**Expected Result:**
- Status: `201 Created`
- Response includes auto-generated `document_number` like: `SOP-QUAL-20251129-0001`
- Response includes `id`, `title`, `status: "Draft"`
- `owner_id` = your user ID (1 for admin)

**Save the document ID for next tests!**

---

**Test Case 1.2: Create document with custom document number**
```json
{
  "title": "Safety SOP",
  "description": "Safety procedures",
  "department": "Safety",
  "tags": ["Safety"],
  "document_number": "CUSTOM-SOP-001"
}
```

**Expected Result:**
- Status: `201 Created`
- `document_number: "CUSTOM-SOP-001"`

**Test Case 1.3: Verify audit log created**
1. Go to `GET /api/v1/audit-logs`
2. Click **"Try it out"** → **"Execute"**
3. Find log with `action: "DOCUMENT_CREATED"`

---

### **Test 2: URS-DVM-011 - List & Search Documents** ✓

**Endpoint:** `GET /api/v1/documents`

**Test Case 2.1: List all documents**
1. Expand `GET /documents`
2. Click **"Try it out"** → **"Execute"**

**Expected Result:**
- Status: `200 OK`
- Returns array of documents
- Includes pagination info: `total`, `page`, `page_size`

**Test Case 2.2: Search by title**
1. Set `title` parameter to: `Quality`
2. Click **"Execute"**

**Expected Result:**
- Only documents with "Quality" in title

**Test Case 2.3: Filter by department**
1. Set `department` to: `Quality Assurance`
2. Click **"Execute"**

**Expected Result:**
- Only QA department documents

**Test Case 2.4: Filter by status**
1. Set `status` to: `Draft`
2. Click **"Execute"**

**Expected Result:**
- Only draft documents

---

### **Test 3: Get Document Details** ✓

**Endpoint:** `GET /api/v1/documents/{id}`

**Test Case 3.1: Get document with versions**
1. Expand `GET /documents/{document_id}`
2. Enter the document ID from Test 1
3. Click **"Execute"**

**Expected Result:**
- Status: `200 OK`
- Full document details
- `versions` array (empty for now)
- Owner information included

---

### **Test 4: URS-DVM-002 - Create Document Version** ✓

**Endpoint:** `POST /api/v1/documents/{doc_id}/versions`

**Test Case 4.1: Create first version**
1. Expand `POST /documents/{document_id}/versions`
2. Enter document ID from Test 1
3. Paste JSON:
```json
{
  "content_html": "<h1>Quality Management SOP</h1><h2>1. Purpose</h2><p>This SOP defines the quality management process...</p><h2>2. Scope</h2><p>Applies to all quality activities...</p>",
  "change_summary": "Initial version"
}
```
4. Click **"Execute"**

**Expected Result:**
- Status: `201 Created`
- `version_number: 1`
- `status: "Draft"`
- `content_hash` computed (SHA-256)
- `created_by_id` = your user ID

**Save the version ID for next tests!**

**Test Case 4.2: Create second version**
Same document, increment version:
```json
{
  "content_html": "<h1>Quality Management SOP - Rev 2</h1><h2>1. Purpose</h2><p>Updated content...</p>",
  "change_summary": "Updated scope section"
}
```

**Expected Result:**
- `version_number: 2`
- New version becomes current version

**Test Case 4.3: Verify audit log**
Check audit logs for `VERSION_CREATED` action

---

### **Test 5: URS-DVM-006 - Edit Lock Management** ✓

**Endpoint:** `POST /api/v1/documents/{doc_id}/versions/{vid}/lock`

**Test Case 5.1: Acquire lock**
1. Expand `POST /documents/{document_id}/versions/{version_id}/lock`
2. Enter document ID and version ID
3. Paste JSON:
```json
{
  "timeout_minutes": 30,
  "session_id": "test-session-123"
}
```
4. Click **"Execute"**

**Expected Result:**
- Status: `200 OK`
- Returns `lock_token` (save this!)
- `expires_at` is 30 minutes in future
- `user_id` = your user ID

**Save the lock_token for next tests!**

**Test Case 5.2: Check lock status**
1. Expand `GET /documents/{document_id}/versions/{version_id}/lock`
2. Enter document ID and version ID
3. Click **"Execute"**

**Expected Result:**
- `is_locked: true`
- `locked_by_username: "admin"`
- Shows expiry time

**Test Case 5.3: Try to acquire lock again (should fail)**
Try to acquire lock again without releasing

**Expected Result:**
- Status: `423 Locked`
- Error: "Version is currently locked by admin"

**Test Case 5.4: Heartbeat to extend lock**
1. Expand `POST /documents/{document_id}/versions/{version_id}/lock/heartbeat`
2. Enter document ID and version ID
3. Paste JSON:
```json
{
  "lock_token": "YOUR_LOCK_TOKEN_HERE",
  "extend_minutes": 30
}
```
4. Click **"Execute"**

**Expected Result:**
- Status: `200 OK`
- `expires_at` updated to 30 minutes from now
- `last_heartbeat` updated

---

### **Test 6: URS-DVM-005 - Save Version Content** ✓

**Endpoint:** `POST /api/v1/documents/{doc_id}/versions/{vid}/save`

**Test Case 6.1: Manual save with lock**
1. Expand `POST /documents/{document_id}/versions/{version_id}/save`
2. Enter document ID and version ID
3. Paste JSON (use YOUR lock token):
```json
{
  "content_html": "<h1>Quality Management SOP - Updated</h1><h2>1. Purpose</h2><p>This is the updated content with more details...</p><h2>2. Scope</h2><p>Expanded scope...</p><h2>3. Responsibilities</h2><p>Added responsibilities section...</p>",
  "lock_token": "YOUR_LOCK_TOKEN_HERE",
  "is_autosave": false
}
```
4. Click **"Execute"**

**Expected Result:**
- Status: `200 OK`
- New `content_hash` computed
- `updated_at` timestamp updated
- `lock_version` incremented
- Audit log created with before/after snapshot

**Test Case 6.2: Autosave**
Same as above but set `"is_autosave": true`

**Expected Result:**
- Same success
- Audit log may be skipped (policy: log every 10th autosave)

**Test Case 6.3: Save without lock (should fail)**
Try to save without `lock_token`:
```json
{
  "content_html": "<h1>Trying to save without lock</h1>",
  "is_autosave": false
}
```

**Expected Result:**
- Status: `403 Forbidden`
- Error: "Version is locked by another user"

**Test Case 6.4: Optimistic concurrency conflict**
1. Get the current `content_hash` from version
2. Save with a wrong/old hash:
```json
{
  "content_html": "<h1>New content</h1>",
  "content_hash": "wrong_hash_value",
  "lock_token": "YOUR_LOCK_TOKEN_HERE",
  "is_autosave": false
}
```

**Expected Result:**
- Status: `409 Conflict`
- Error: "Content has been modified by another user"
- Headers include `X-Current-Content-Hash` and `X-Conflict: true`

---

### **Test 7: URS-DVM-003 - Update Draft Version Metadata** ✓

**Endpoint:** `PATCH /api/v1/documents/{doc_id}/versions/{vid}`

**Test Case 7.1: Update change summary**
```json
{
  "change_summary": "Updated: Added responsibilities section and expanded scope"
}
```

**Expected Result:**
- Status: `200 OK`
- `change_summary` updated
- Audit log created with before/after changes

**Test Case 7.2: Cannot update non-draft version**
1. Create a version
2. Try to update it after changing status (we haven't implemented workflow yet, so skip this for now)

---

### **Test 8: URS-DVM-007 - Attachment Upload/Download** ✓

**Endpoint:** `POST /api/v1/attachments`

**Test Case 8.1: Upload file**
1. Expand `POST /attachments`
2. Click **"Try it out"**
3. Click **"Choose File"** and select a PDF/DOCX/image
4. Fill form fields:
   - `description`: "Supporting document for SOP"
   - `attachment_type`: "supporting_document"
   - `document_id`: your document ID
5. Click **"Execute"**

**Expected Result:**
- Status: `201 Created`
- File saved to `storage/attachments/` with checksum as filename
- Returns metadata: `filename`, `file_size`, `checksum_sha256`
- `download_url` provided

**Save the attachment ID!**

**Test Case 8.2: Get attachment metadata**
1. Expand `GET /attachments/{attachment_id}`
2. Enter attachment ID
3. Click **"Execute"**

**Expected Result:**
- Status: `200 OK`
- Full metadata returned
- Uploader information included

**Test Case 8.3: Download attachment**
1. Expand `GET /attachments/{attachment_id}/download`
2. Enter attachment ID
3. Click **"Execute"**
4. Click **"Download file"** link in response

**Expected Result:**
- File downloads with original filename
- Content matches uploaded file

**Test Case 8.4: List document attachments**
1. Expand `GET /attachments/document/{document_id}/list`
2. Enter document ID
3. Click **"Execute"**

**Expected Result:**
- Returns array of all attachments for that document

**Test Case 8.5: Delete attachment**
1. Expand `DELETE /attachments/{attachment_id}`
2. Enter attachment ID
3. Click **"Execute"**

**Expected Result:**
- Status: `204 No Content`
- Soft deleted (file remains on disk)
- Audit log created

---

### **Test 9: Release Edit Lock** ✓

**Endpoint:** `DELETE /api/v1/documents/{doc_id}/versions/{vid}/lock`

**Test Case 9.1: Release lock**
1. Expand `DELETE /documents/{document_id}/versions/{version_id}/lock`
2. Enter document ID and version ID
3. Paste JSON:
```json
{
  "lock_token": "YOUR_LOCK_TOKEN_HERE"
}
```
4. Click **"Execute"**

**Expected Result:**
- Status: `204 No Content`
- Lock removed
- Can now be acquired by another user
- Audit log created

---

### **Test 10: Update Document Metadata** ✓

**Endpoint:** `PATCH /api/v1/documents/{id}`

**Test Case 10.1: Update document**
```json
{
  "title": "Quality Management SOP - Updated Title",
  "description": "Updated description with more details",
  "tags": ["QA", "Quality", "Process", "Updated"]
}
```

**Expected Result:**
- Status: `200 OK`
- Metadata updated
- Audit log with before/after changes

---

### **Test 11: List Versions** ✓

**Endpoint:** `GET /api/v1/documents/{doc_id}/versions`

**Test Case 11.1: List all versions**
1. Expand `GET /documents/{document_id}/versions`
2. Enter document ID
3. Click **"Execute"**

**Expected Result:**
- Returns array of versions
- Ordered by version number (descending)
- Includes creator username and timestamps

---

### **Test 12: Get Specific Version** ✓

**Endpoint:** `GET /api/v1/documents/{doc_id}/versions/{vid}`

**Test Case 12.1: Get version with content**
1. Expand `GET /documents/{document_id}/versions/{version_id}`
2. Enter document ID and version ID
3. Click **"Execute"**

**Expected Result:**
- Status: `200 OK`
- Full version details with `content_html`
- Lock status included
- All workflow timestamps

---

### **Test 13: Delete Document** ✓

**Endpoint:** `DELETE /api/v1/documents/{id}`

**Test Case 13.1: Soft delete**
1. Expand `DELETE /documents/{document_id}`
2. Enter document ID
3. Click **"Execute"**

**Expected Result:**
- Status: `204 No Content`
- Document marked as deleted (`is_deleted = true`)
- Doesn't appear in list anymore
- Audit log created

---

### **Test 14: RBAC Enforcement** ✓

**Test Case 14.1: Non-Author cannot create document**
1. Create a user with only "Reviewer" role
2. Login as that user
3. Try to create document

**Expected Result:**
- Status: `403 Forbidden`
- Error: "Only Authors and Admins can create documents"

**Test Case 14.2: Non-owner cannot edit document**
1. User A creates document
2. User B (different Author) tries to edit
3. Should fail unless User B is admin

---

### **Test 15: Audit Logs for All Actions** ✓

**Endpoint:** `GET /api/v1/audit-logs`

**Test Case 15.1: Verify all actions logged**
1. Expand `GET /audit-logs`
2. Set `page_size: 100`
3. Click **"Execute"**

**Expected Actions:**
- `DOCUMENT_CREATED`
- `VERSION_CREATED`
- `VERSION_SAVED`
- `VERSION_AUTOSAVED`
- `LOCK_ACQUIRED`
- `LOCK_RELEASED`
- `ATTACHMENT_UPLOADED`
- `ATTACHMENT_DOWNLOADED`
- `DOCUMENT_UPDATED`
- `DOCUMENT_DELETED`

**Verify each log has:**
- `user_id`, `username`
- `action`, `entity_type`, `entity_id`
- `description`
- `details` (with before/after for updates)
- `timestamp`

---

## 🎯 Quick Test Workflow

**Complete flow in 10 minutes:**

1. **Create Document** → Get document ID
2. **Create Version** → Get version ID
3. **Acquire Lock** → Get lock token
4. **Save Content** → Verify hash updated
5. **Heartbeat** → Extend lock
6. **Upload Attachment** → Get attachment ID
7. **Download Attachment** → Verify file
8. **List Documents** → See your document
9. **Check Audit Logs** → All actions logged
10. **Release Lock** → Clean up

---

## 🐛 Common Issues & Solutions

### **Issue 1: Lock already exists**
**Solution:** Release existing lock or wait for expiry (30 min)

### **Issue 2: 403 Forbidden on save**
**Solution:** Acquire lock first with correct user

### **Issue 3: 409 Conflict on save**
**Solution:** Don't send `content_hash` or send correct current hash

### **Issue 4: File upload fails**
**Solution:** Check `storage/attachments/` directory exists and is writable

### **Issue 5: Attachment not found**
**Solution:** Check file wasn't soft-deleted

---

## ✅ Success Criteria

All tests pass if:

- ✅ All 15 test sections complete successfully
- ✅ No 500 errors
- ✅ All audit logs created correctly
- ✅ RBAC enforced properly
- ✅ Files uploaded/downloaded correctly
- ✅ Locks acquired/released properly
- ✅ Content hashes computed correctly
- ✅ Version numbers auto-increment
- ✅ Document numbers auto-generate

---

## 📊 Test Results Template

| Test | Status | Notes |
|------|--------|-------|
| 1. Create Document | ⏳ | |
| 2. List/Search Documents | ⏳ | |
| 3. Get Document Details | ⏳ | |
| 4. Create Version | ⏳ | |
| 5. Edit Lock Management | ⏳ | |
| 6. Save Content | ⏳ | |
| 7. Update Version Metadata | ⏳ | |
| 8. Attachment Upload/Download | ⏳ | |
| 9. Release Lock | ⏳ | |
| 10. Update Document | ⏳ | |
| 11. List Versions | ⏳ | |
| 12. Get Specific Version | ⏳ | |
| 13. Delete Document | ⏳ | |
| 14. RBAC Enforcement | ⏳ | |
| 15. Audit Logs | ⏳ | |

---

## 🚀 After Testing

Once all tests pass:
1. ✅ Backend is production-ready for Sprint 2
2. ✅ Ready to build frontend
3. ✅ Ready for Syncfusion integration

**Next:** Frontend implementation with React + Syncfusion DocumentEditor!


