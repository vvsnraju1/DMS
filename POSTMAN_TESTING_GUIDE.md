# Complete Postman Testing Guide - Sprint 2

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Get Authentication Token](#test-0-authentication)
3. [Document Management Tests](#document-management)
4. [Version Management Tests](#version-management)
5. [Edit Lock Tests](#edit-lock-tests)
6. [Attachment Tests](#attachment-tests)
7. [Audit Log Tests](#audit-log-tests)
8. [Variables Reference](#variables-reference)

---

## Initial Setup

### **Postman Environment Variables**

Create a new environment in Postman called "DMS Local" with these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:8000/api/v1` | |
| `token` | | (will be set after login) |
| `document_id` | | (will be set after creating document) |
| `version_id` | | (will be set after creating version) |
| `lock_token` | | (will be set after acquiring lock) |
| `attachment_id` | | (will be set after uploading attachment) |

---

## Test 0: Authentication

### **Login and Get Token**

**Method:** `POST`

**URL:** `http://localhost:8000/api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "admin",
  "password": "Admin@123456"
}
```

**Expected Response (200 OK):**
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

**📝 Action:** Copy the `access_token` value and save it to the `token` environment variable.

---

## Document Management

### **Test 1: Create Document (Auto-Generated Number)**

**Method:** `POST`

**URL:** `{{base_url}}/documents`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "title": "Quality Management Standard Operating Procedure",
  "description": "This SOP defines quality management processes and procedures for pharmaceutical operations",
  "department": "Quality Assurance",
  "tags": ["QA", "Quality", "Compliance", "GMP"]
}
```

**Expected Response (201 Created):**
```json
{
  "title": "Quality Management Standard Operating Procedure",
  "description": "This SOP defines quality management processes and procedures for pharmaceutical operations",
  "department": "Quality Assurance",
  "tags": ["QA", "Quality", "Compliance", "GMP"],
  "id": 1,
  "document_number": "SOP-QUAL-20251129-0001",
  "owner_id": 1,
  "created_by_id": 1,
  "current_version_id": null,
  "status": "Draft",
  "created_at": "2025-11-29T10:30:00.123456",
  "updated_at": "2025-11-29T10:30:00.123456",
  "is_deleted": false,
  "owner_username": "admin",
  "owner_full_name": "System Administrator",
  "version_count": 0
}
```

**📝 Action:** Save the `id` value (1) to the `document_id` environment variable.

---

### **Test 2: Create Document with Custom Number**

**Method:** `POST`

**URL:** `{{base_url}}/documents`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "title": "Safety Procedures Manual",
  "description": "Comprehensive safety procedures for laboratory operations",
  "department": "Safety",
  "tags": ["Safety", "Lab", "Procedures"],
  "document_number": "SAFE-LAB-2025-001"
}
```

**Expected Response (201 Created):**
```json
{
  "title": "Safety Procedures Manual",
  "description": "Comprehensive safety procedures for laboratory operations",
  "department": "Safety",
  "tags": ["Safety", "Lab", "Procedures"],
  "id": 2,
  "document_number": "SAFE-LAB-2025-001",
  "owner_id": 1,
  "created_by_id": 1,
  "current_version_id": null,
  "status": "Draft",
  "created_at": "2025-11-29T10:31:00.123456",
  "updated_at": "2025-11-29T10:31:00.123456",
  "is_deleted": false,
  "owner_username": "admin",
  "owner_full_name": "System Administrator",
  "version_count": 0
}
```

---

### **Test 3: List All Documents**

**Method:** `GET`

**URL:** `{{base_url}}/documents?page=1&page_size=20`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "documents": [
    {
      "title": "Safety Procedures Manual",
      "description": "Comprehensive safety procedures for laboratory operations",
      "department": "Safety",
      "tags": ["Safety", "Lab", "Procedures"],
      "id": 2,
      "document_number": "SAFE-LAB-2025-001",
      "owner_id": 1,
      "created_by_id": 1,
      "current_version_id": null,
      "status": "Draft",
      "created_at": "2025-11-29T10:31:00.123456",
      "updated_at": "2025-11-29T10:31:00.123456",
      "is_deleted": false,
      "owner_username": "admin",
      "owner_full_name": "System Administrator",
      "version_count": 0
    },
    {
      "title": "Quality Management Standard Operating Procedure",
      "description": "This SOP defines quality management processes...",
      "department": "Quality Assurance",
      "tags": ["QA", "Quality", "Compliance", "GMP"],
      "id": 1,
      "document_number": "SOP-QUAL-20251129-0001",
      "owner_id": 1,
      "created_by_id": 1,
      "current_version_id": null,
      "status": "Draft",
      "created_at": "2025-11-29T10:30:00.123456",
      "updated_at": "2025-11-29T10:30:00.123456",
      "is_deleted": false,
      "owner_username": "admin",
      "owner_full_name": "System Administrator",
      "version_count": 0
    }
  ],
  "total": 2,
  "page": 1,
  "page_size": 20
}
```

---

### **Test 4: Search Documents by Title**

**Method:** `GET`

**URL:** `{{base_url}}/documents?title=Quality&page=1&page_size=20`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "documents": [
    {
      "title": "Quality Management Standard Operating Procedure",
      "id": 1,
      "document_number": "SOP-QUAL-20251129-0001",
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

---

### **Test 5: Filter by Department**

**Method:** `GET`

**URL:** `{{base_url}}/documents?department=Quality Assurance&page=1&page_size=20`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
- Returns only documents from Quality Assurance department

---

### **Test 6: Get Document Details**

**Method:** `GET`

**URL:** `{{base_url}}/documents/{{document_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "title": "Quality Management Standard Operating Procedure",
  "description": "This SOP defines quality management processes...",
  "department": "Quality Assurance",
  "tags": ["QA", "Quality", "Compliance", "GMP"],
  "id": 1,
  "document_number": "SOP-QUAL-20251129-0001",
  "owner_id": 1,
  "created_by_id": 1,
  "current_version_id": null,
  "status": "Draft",
  "created_at": "2025-11-29T10:30:00.123456",
  "updated_at": "2025-11-29T10:30:00.123456",
  "is_deleted": false,
  "owner_username": "admin",
  "owner_full_name": "System Administrator",
  "version_count": 0,
  "versions": []
}
```

---

### **Test 7: Update Document Metadata**

**Method:** `PATCH`

**URL:** `{{base_url}}/documents/{{document_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "title": "Quality Management SOP - Updated Title",
  "description": "Updated description with additional compliance requirements",
  "tags": ["QA", "Quality", "Compliance", "GMP", "ISO9001"]
}
```

**Expected Response (200 OK):**
```json
{
  "title": "Quality Management SOP - Updated Title",
  "description": "Updated description with additional compliance requirements",
  "department": "Quality Assurance",
  "tags": ["QA", "Quality", "Compliance", "GMP", "ISO9001"],
  "id": 1,
  "document_number": "SOP-QUAL-20251129-0001",
  "owner_id": 1,
  "created_by_id": 1,
  "current_version_id": null,
  "status": "Draft",
  "created_at": "2025-11-29T10:30:00.123456",
  "updated_at": "2025-11-29T10:35:00.123456",
  "is_deleted": false,
  "owner_username": "admin",
  "owner_full_name": "System Administrator",
  "version_count": 0
}
```

---

## Version Management

### **Test 8: Create First Version**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "content_html": "<h1>Quality Management SOP</h1><h2>1. Purpose</h2><p>This Standard Operating Procedure (SOP) defines the quality management system and processes for pharmaceutical manufacturing operations.</p><h2>2. Scope</h2><p>This SOP applies to all quality-related activities including:</p><ul><li>Quality control testing</li><li>Quality assurance reviews</li><li>Deviation management</li><li>CAPA processes</li></ul><h2>3. Responsibilities</h2><p>Quality Manager: Overall responsibility for QMS implementation</p><p>QA Staff: Day-to-day quality activities</p>",
  "change_summary": "Initial version - establishing quality management framework"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "document_id": 1,
  "version_number": 1,
  "content_html": "<h1>Quality Management SOP</h1><h2>1. Purpose</h2>...",
  "content_hash": "a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
  "change_summary": "Initial version - establishing quality management framework",
  "status": "Draft",
  "attachments_metadata": [],
  "docx_attachment_id": null,
  "created_by_id": 1,
  "created_at": "2025-11-29T10:40:00.123456",
  "updated_at": "2025-11-29T10:40:00.123456",
  "submitted_at": null,
  "submitted_by_id": null,
  "reviewed_at": null,
  "reviewed_by_id": null,
  "review_comments": null,
  "approved_at": null,
  "approved_by_id": null,
  "approval_comments": null,
  "published_at": null,
  "published_by_id": null,
  "rejected_at": null,
  "rejected_by_id": null,
  "rejection_reason": null,
  "archived_at": null,
  "archived_by_id": null,
  "lock_version": 0,
  "created_by_username": "admin",
  "created_by_full_name": "System Administrator",
  "is_locked": false,
  "locked_by_user_id": null,
  "locked_by_username": null,
  "lock_expires_at": null
}
```

**📝 Action:** Save the `id` value to the `version_id` environment variable.

---

### **Test 9: Create Second Version**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "content_html": "<h1>Quality Management SOP - Rev 2</h1><h2>1. Purpose</h2><p>This SOP defines the quality management system (updated with FDA requirements).</p><h2>2. Scope</h2><p>Expanded scope to include risk management...</p>",
  "change_summary": "Added FDA requirements and risk management section"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 2,
  "document_id": 1,
  "version_number": 2,
  "content_html": "<h1>Quality Management SOP - Rev 2</h1>...",
  "content_hash": "b8e4c3d2f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a2",
  "change_summary": "Added FDA requirements and risk management section",
  "status": "Draft",
  ...
}
```

---

### **Test 10: List All Versions**

**Method:** `GET`

**URL:** `{{base_url}}/documents/{{document_id}}/versions?page=1&page_size=20`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "versions": [
    {
      "id": 2,
      "document_id": 1,
      "version_number": 2,
      "status": "Draft",
      "change_summary": "Added FDA requirements and risk management section",
      "created_by_id": 1,
      "created_by_username": "admin",
      "created_at": "2025-11-29T10:45:00.123456",
      "updated_at": "2025-11-29T10:45:00.123456"
    },
    {
      "id": 1,
      "document_id": 1,
      "version_number": 1,
      "status": "Draft",
      "change_summary": "Initial version - establishing quality management framework",
      "created_by_id": 1,
      "created_by_username": "admin",
      "created_at": "2025-11-29T10:40:00.123456",
      "updated_at": "2025-11-29T10:40:00.123456"
    }
  ],
  "total": 2,
  "page": 1,
  "page_size": 20
}
```

---

### **Test 11: Get Specific Version**

**Method:** `GET`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
- Full version details including complete `content_html`
- Lock status information

---

### **Test 12: Update Version Metadata**

**Method:** `PATCH`

**URL:** `  `

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "change_summary": "Updated: Added FDA requirements, risk management section, and updated responsibilities"
}
```

**Expected Response (200 OK):**
- Version with updated `change_summary`

---

## Edit Lock Tests

### **Test 13: Acquire Edit Lock**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/lock`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "timeout_minutes": 30,
  "session_id": "postman-test-session-12345"
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "document_version_id": 1,
  "user_id": 1,
  "lock_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "acquired_at": "2025-11-29T10:50:00.123456",
  "expires_at": "2025-11-29T11:20:00.123456",
  "last_heartbeat": "2025-11-29T10:50:00.123456",
  "session_id": "postman-test-session-12345",
  "username": "admin",
  "user_full_name": "System Administrator",
  "is_expired": false,
  "time_remaining_seconds": 1800
}
```

**📝 Action:** Save the `lock_token` value to the `lock_token` environment variable.

---

### **Test 14: Check Lock Status**

**Method:** `GET`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/lock`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "is_locked": true,
  "locked_by_user_id": 1,
  "locked_by_username": "admin",
  "lock_expires_at": "2025-11-29T11:20:00.123456",
  "can_acquire": false,
  "lock_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
}
```

---

### **Test 15: Try to Acquire Lock Again (Should Fail)**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/lock`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "timeout_minutes": 30,
  "session_id": "another-session"
}
```

**Expected Response (423 Locked):**
```json
{
  "detail": "Version is currently locked by admin"
}
```

**Headers:**
```
X-Lock-Owner: admin
X-Lock-Expires: 2025-11-29T11:20:00.123456
```

---

### **Test 16: Refresh Lock (Heartbeat)**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/lock/heartbeat`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "lock_token": "{{lock_token}}",
  "extend_minutes": 30
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "document_version_id": 1,
  "user_id": 1,
  "lock_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "acquired_at": "2025-11-29T10:50:00.123456",
  "expires_at": "2025-11-29T11:25:00.123456",
  "last_heartbeat": "2025-11-29T10:55:00.123456",
  "session_id": "postman-test-session-12345",
  "username": "admin",
  "user_full_name": "System Administrator",
  "is_expired": false,
  "time_remaining_seconds": 1800
}
```

**Notice:** `expires_at` and `last_heartbeat` are updated.

---

### **Test 17: Save Version Content (Manual Save)**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/save`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "content_html": "<h1>Quality Management SOP</h1><h2>1. Purpose</h2><p>This SOP defines the quality management system (UPDATED CONTENT with more details).</p><h2>2. Scope</h2><p>Comprehensive scope covering all quality activities...</p><h2>3. Responsibilities</h2><p>Quality Manager: Strategic oversight and system implementation</p><p>QA Staff: Operational quality activities and compliance monitoring</p><h2>4. Procedures</h2><p>4.1 Document Control</p><p>4.2 Deviation Management</p><p>4.3 CAPA Process</p>",
  "lock_token": "{{lock_token}}",
  "is_autosave": false
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "document_id": 1,
  "version_number": 1,
  "content_html": "<h1>Quality Management SOP</h1><h2>1. Purpose</h2>...",
  "content_hash": "c9f5d4e3a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
  "change_summary": "Updated: Added FDA requirements...",
  "status": "Draft",
  "lock_version": 1,
  "updated_at": "2025-11-29T10:56:00.123456",
  ...
}
```

**Notice:** `content_hash` changed, `lock_version` incremented to 1, `updated_at` timestamp updated.

---

### **Test 18: Autosave**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/save`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "content_html": "<h1>Quality Management SOP</h1><h2>1. Purpose</h2><p>Autosaved content...</p>",
  "lock_token": "{{lock_token}}",
  "is_autosave": true
}
```

**Expected Response (200 OK):**
- Similar to manual save
- Audit log may be skipped (only logged every 10th autosave)

---

### **Test 19: Try to Save Without Lock (Should Fail)**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/save`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "content_html": "<h1>Trying to save without lock</h1>",
  "is_autosave": false
}
```

**Expected Response (403 Forbidden):**
```json
{
  "detail": "Version is locked by another user: admin"
}
```

---

### **Test 20: Optimistic Concurrency Conflict**

**Method:** `POST`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/save`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "content_html": "<h1>New content</h1>",
  "content_hash": "wrong_old_hash_value_12345",
  "lock_token": "{{lock_token}}",
  "is_autosave": false
}
```

**Expected Response (409 Conflict):**
```json
{
  "detail": "Content has been modified by another user"
}
```

**Headers:**
```
X-Current-Content-Hash: c9f5d4e3a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3
X-Conflict: true
```

---

### **Test 21: Release Lock**

**Method:** `DELETE`

**URL:** `{{base_url}}/documents/{{document_id}}/versions/{{version_id}}/lock`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "lock_token": "{{lock_token}}"
}
```

**Expected Response (204 No Content):**
- Empty body
- Lock removed from database

---

## Attachment Tests

### **Test 22: Upload Attachment**

**Method:** `POST`

**URL:** `{{base_url}}/attachments`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Body (form-data):**
| Key | Value | Type |
|-----|-------|------|
| `file` | (Choose a PDF/DOCX file) | File |
| `description` | Supporting document for Quality SOP | Text |
| `attachment_type` | supporting_document | Text |
| `document_id` | {{document_id}} | Text |

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "filename": "a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1.pdf",
  "original_filename": "quality_sop_supporting_doc.pdf",
  "mime_type": "application/pdf",
  "file_size": 245678,
  "storage_path": "storage/attachments/a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1.pdf",
  "storage_type": "local",
  "checksum_sha256": "a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
  "document_version_id": null,
  "document_id": 1,
  "uploaded_by_id": 1,
  "uploaded_at": "2025-11-29T11:00:00.123456",
  "description": "Supporting document for Quality SOP",
  "attachment_type": "supporting_document",
  "scan_status": "pending",
  "scan_result": null,
  "scanned_at": null,
  "is_deleted": false,
  "uploaded_by_username": "admin",
  "uploaded_by_full_name": "System Administrator",
  "download_url": "/api/v1/attachments/1/download"
}
```

**📝 Action:** Save the `id` value to the `attachment_id` environment variable.

---

### **Test 23: Get Attachment Metadata**

**Method:** `GET`

**URL:** `{{base_url}}/attachments/{{attachment_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
- Full attachment metadata (same as upload response)

---

### **Test 24: Download Attachment**

**Method:** `GET`

**URL:** `{{base_url}}/attachments/{{attachment_id}}/download`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
- File is downloaded with original filename
- Content-Type matches file type (e.g., `application/pdf`)
- Content-Disposition header: `attachment; filename="quality_sop_supporting_doc.pdf"`

**In Postman:** Click "Send and Download" to save file.

---

### **Test 25: List Document Attachments**

**Method:** `GET`

**URL:** `{{base_url}}/attachments/document/{{document_id}}/list`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "attachments": [
    {
      "id": 1,
      "filename": "a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1.pdf",
      "original_filename": "quality_sop_supporting_doc.pdf",
      "mime_type": "application/pdf",
      "file_size": 245678,
      ...
    }
  ],
  "total": 1
}
```

---

### **Test 26: Delete Attachment**

**Method:** `DELETE`

**URL:** `{{base_url}}/attachments/{{attachment_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (204 No Content):**
- Empty body
- Attachment soft-deleted (`is_deleted = true`)
- File remains on disk

---

## Audit Log Tests

### **Test 27: View All Audit Logs**

**Method:** `GET`

**URL:** `{{base_url}}/audit-logs?page=1&page_size=50`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 15,
      "user_id": 1,
      "username": "admin",
      "action": "ATTACHMENT_DELETED",
      "entity_type": "Attachment",
      "entity_id": 1,
      "description": "Deleted attachment: quality_sop_supporting_doc.pdf",
      "details": {
        "attachment_id": 1,
        "filename": "quality_sop_supporting_doc.pdf"
      },
      "ip_address": null,
      "user_agent": null,
      "timestamp": "2025-11-29T11:05:00.123456"
    },
    {
      "id": 14,
      "user_id": 1,
      "username": "admin",
      "action": "ATTACHMENT_DOWNLOADED",
      "entity_type": "Attachment",
      "entity_id": 1,
      "description": "Downloaded attachment: quality_sop_supporting_doc.pdf",
      "details": {
        "attachment_id": 1
      },
      "timestamp": "2025-11-29T11:03:00.123456"
    },
    {
      "id": 13,
      "user_id": 1,
      "username": "admin",
      "action": "ATTACHMENT_UPLOADED",
      "entity_type": "Attachment",
      "entity_id": 1,
      "description": "Uploaded attachment: quality_sop_supporting_doc.pdf",
      "details": {
        "filename": "quality_sop_supporting_doc.pdf",
        "file_size": 245678,
        "mime_type": "application/pdf",
        "checksum": "a7f3b2c1d4e5f6a7...",
        "document_id": 1,
        "document_version_id": null
      },
      "timestamp": "2025-11-29T11:00:00.123456"
    },
    {
      "id": 12,
      "user_id": 1,
      "username": "admin",
      "action": "LOCK_RELEASED",
      "entity_type": "DocumentVersion",
      "entity_id": 1,
      "description": "Released edit lock on version",
      "details": {
        "document_id": 1,
        "version_id": 1,
        "was_owner": true,
        "forced_by_admin": false
      },
      "timestamp": "2025-11-29T10:58:00.123456"
    },
    {
      "id": 11,
      "user_id": 1,
      "username": "admin",
      "action": "VERSION_SAVED",
      "entity_type": "DocumentVersion",
      "entity_id": 1,
      "description": "Saved version 1 content",
      "details": {
        "before": {
          "content_hash": "a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
          "updated_at": "2025-11-29T10:40:00.123456"
        },
        "after": {
          "content_hash": "c9f5d4e3a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
          "updated_at": "2025-11-29T10:56:00.123456"
        },
        "is_autosave": false,
        "lock_version": 1
      },
      "timestamp": "2025-11-29T10:56:00.123456"
    },
    {
      "id": 10,
      "user_id": 1,
      "username": "admin",
      "action": "LOCK_ACQUIRED",
      "entity_type": "DocumentVersion",
      "entity_id": 1,
      "description": "Acquired edit lock on version 1",
      "details": {
        "document_id": 1,
        "version_id": 1,
        "expires_at": "2025-11-29T11:20:00.123456",
        "timeout_minutes": 30
      },
      "timestamp": "2025-11-29T10:50:00.123456"
    },
    {
      "id": 9,
      "user_id": 1,
      "username": "admin",
      "action": "VERSION_UPDATED",
      "entity_type": "DocumentVersion",
      "entity_id": 1,
      "description": "Updated version 1 metadata",
      "details": {
        "changes": {
          "change_summary": {
            "old": "Initial version - establishing quality management framework",
            "new": "Updated: Added FDA requirements, risk management section, and updated responsibilities"
          }
        }
      },
      "timestamp": "2025-11-29T10:48:00.123456"
    },
    {
      "id": 8,
      "user_id": 1,
      "username": "admin",
      "action": "VERSION_CREATED",
      "entity_type": "DocumentVersion",
      "entity_id": 2,
      "description": "Created version 2 for document SOP-QUAL-20251129-0001",
      "details": {
        "document_id": 1,
        "document_number": "SOP-QUAL-20251129-0001",
        "version_number": 2,
        "change_summary": "Added FDA requirements and risk management section"
      },
      "timestamp": "2025-11-29T10:45:00.123456"
    },
    {
      "id": 7,
      "user_id": 1,
      "username": "admin",
      "action": "VERSION_CREATED",
      "entity_type": "DocumentVersion",
      "entity_id": 1,
      "description": "Created version 1 for document SOP-QUAL-20251129-0001",
      "details": {
        "document_id": 1,
        "document_number": "SOP-QUAL-20251129-0001",
        "version_number": 1,
        "change_summary": "Initial version - establishing quality management framework"
      },
      "timestamp": "2025-11-29T10:40:00.123456"
    },
    {
      "id": 6,
      "user_id": 1,
      "username": "admin",
      "action": "DOCUMENT_UPDATED",
      "entity_type": "Document",
      "entity_id": 1,
      "description": "Updated document SOP-QUAL-20251129-0001",
      "details": {
        "changes": {
          "title": {
            "old": "Quality Management Standard Operating Procedure",
            "new": "Quality Management SOP - Updated Title"
          },
          "description": {
            "old": "This SOP defines quality management processes...",
            "new": "Updated description with additional compliance requirements"
          },
          "tags": {
            "old": ["QA", "Quality", "Compliance", "GMP"],
            "new": ["QA", "Quality", "Compliance", "GMP", "ISO9001"]
          }
        }
      },
      "timestamp": "2025-11-29T10:35:00.123456"
    },
    {
      "id": 5,
      "user_id": 1,
      "username": "admin",
      "action": "DOCUMENT_CREATED",
      "entity_type": "Document",
      "entity_id": 2,
      "description": "Created document SAFE-LAB-2025-001: Safety Procedures Manual",
      "details": {
        "document_number": "SAFE-LAB-2025-001",
        "title": "Safety Procedures Manual",
        "department": "Safety",
        "owner_id": 1
      },
      "timestamp": "2025-11-29T10:31:00.123456"
    },
    {
      "id": 4,
      "user_id": 1,
      "username": "admin",
      "action": "DOCUMENT_CREATED",
      "entity_type": "Document",
      "entity_id": 1,
      "description": "Created document SOP-QUAL-20251129-0001: Quality Management Standard Operating Procedure",
      "details": {
        "document_number": "SOP-QUAL-20251129-0001",
        "title": "Quality Management Standard Operating Procedure",
        "department": "Quality Assurance",
        "owner_id": 1
      },
      "timestamp": "2025-11-29T10:30:00.123456"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 50
}
```

---

### **Test 28: Filter Audit Logs by Action**

**Method:** `GET`

**URL:** `{{base_url}}/audit-logs?action=VERSION_CREATED&page=1&page_size=20`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
- Only logs with `action: "VERSION_CREATED"`

---

### **Test 29: Filter by Entity Type**

**Method:** `GET`

**URL:** `{{base_url}}/audit-logs?entity_type=Document&page=1&page_size=20`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
- Only logs for Document entity

---

### **Test 30: Filter by Username**

**Method:** `GET`

**URL:** `{{base_url}}/audit-logs?username=admin&page=1&page_size=20`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
- Only logs by admin user

---

## Variables Reference

After running all tests, your Postman environment should have:

| Variable | Example Value |
|----------|---------------|
| `base_url` | `http://localhost:8000/api/v1` |
| `token` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `document_id` | `1` |
| `version_id` | `1` |
| `lock_token` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...` |
| `attachment_id` | `1` |

---

## Testing Checklist

- [ ] Test 0: Authentication (get token)
- [ ] Test 1: Create document with auto number
- [ ] Test 2: Create document with custom number
- [ ] Test 3: List all documents
- [ ] Test 4: Search documents by title
- [ ] Test 5: Filter by department
- [ ] Test 6: Get document details
- [ ] Test 7: Update document metadata
- [ ] Test 8: Create first version
- [ ] Test 9: Create second version
- [ ] Test 10: List all versions
- [ ] Test 11: Get specific version
- [ ] Test 12: Update version metadata
- [ ] Test 13: Acquire edit lock
- [ ] Test 14: Check lock status
- [ ] Test 15: Try to acquire lock again (fail)
- [ ] Test 16: Refresh lock (heartbeat)
- [ ] Test 17: Save version content (manual)
- [ ] Test 18: Autosave
- [ ] Test 19: Try to save without lock (fail)
- [ ] Test 20: Optimistic concurrency conflict
- [ ] Test 21: Release lock
- [ ] Test 22: Upload attachment
- [ ] Test 23: Get attachment metadata
- [ ] Test 24: Download attachment
- [ ] Test 25: List document attachments
- [ ] Test 26: Delete attachment
- [ ] Test 27: View all audit logs
- [ ] Test 28: Filter audit logs by action
- [ ] Test 29: Filter by entity type
- [ ] Test 30: Filter by username

---

## Success Criteria

✅ **All tests pass with expected status codes and responses**

✅ **30/30 tests successful**

✅ **Audit logs contain all actions**

✅ **Files uploaded and downloadable**

✅ **Lock mechanism working correctly**

✅ **Content hashes computed properly**

✅ **Version numbers auto-increment**

✅ **Document numbers auto-generate**

---

## 🎉 Ready to Test!

Import the environment variables and start testing in order from Test 0 to Test 30.


