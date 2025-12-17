# Document Templates Module Implementation

## Overview
This document describes the implementation of the Document Templates module for the QuantXAI DMS. The module allows Admins and Authors to upload DOCX templates, which go through a review and approval workflow before being published and used for creating new documents.

## Backend Implementation

### Models (`backend/app/models/template.py`)
- **Template**: Stores template metadata (name, description, category, department)
- **TemplateVersion**: Stores uploaded DOCX file path, preview HTML path, version number, and status
- **TemplateReview**: Stores reviewer comments
- **TemplateApproval**: Stores approver decisions with e-signature data

### Status Workflow
1. **Draft** → Newly uploaded template
2. **UnderReview** → Submitted for review
3. **PendingApproval** → Submitted for approval
4. **Published** → Approved and finalized
5. **Rejected** → Rejected during approval

### API Endpoints (`backend/app/api/v1/templates.py`)
- `POST /api/v1/templates/upload` - Upload DOCX template (Admin/Author)
- `GET /api/v1/templates` - List templates with filters
- `GET /api/v1/templates/published` - Get only published templates
- `GET /api/v1/templates/{template_id}/versions` - List template versions
- `GET /api/v1/templates/{template_id}/versions/{version_id}` - Get version details
- `POST /api/v1/templates/{template_id}/versions/{version_id}/submit-for-review` - Submit for review
- `POST /api/v1/templates/{template_id}/versions/{version_id}/reviews` - Add review comment
- `POST /api/v1/templates/{template_id}/versions/{version_id}/submit-for-approval` - Submit for approval
- `POST /api/v1/templates/{template_id}/versions/{version_id}/approve` - Approve/reject template
- `POST /api/v1/templates/{template_id}/versions/{version_id}/publish` - Publish template
- `GET /api/v1/templates/{template_id}/versions/{version_id}/html` - Get template HTML for document creation
- `GET /api/v1/templates/images/{filename}` - Serve template images

### DOCX to HTML Conversion (`backend/app/utils/template_converter.py`)
- Uses `python-mammoth` to convert DOCX to HTML
- Extracts images and saves them to `storage/templates/images/`
- Sanitizes HTML using `bleach`
- Validates required headings in HTML content

### Storage Structure
- DOCX files: `storage/templates/originals/template_{id}_v{version}.docx`
- HTML previews: `storage/templates/previews/template_{id}_v{version}.html`
- Images: `storage/templates/images/template_{id}_v{version}/{image_filename}`

### Database Migration
- Migration file: `backend/alembic/versions/005_add_templates.py`
- Creates tables: `templates`, `template_versions`, `template_reviews`, `template_approvals`

## Frontend Implementation

### Services (`frontend/src/services/template.service.ts`)
- Complete TypeScript service for all template operations
- Type definitions for Template, TemplateVersion, TemplateReview, TemplateApproval

### Pages
1. **TemplateList** (`frontend/src/pages/Templates/TemplateList.tsx`)
   - Lists all templates with filters
   - Shows template status and version count
   - Admin/Author can upload templates

2. **TemplateUpload** (`frontend/src/pages/Templates/TemplateUpload.tsx`)
   - Upload DOCX files
   - Set template metadata (name, description, category, department)

3. **TemplateVersions** (`frontend/src/pages/Templates/TemplateVersions.tsx`)
   - View all versions of a template
   - Submit for review/approval
   - Navigate to review/approval pages

4. **TemplateReview** (`frontend/src/pages/Templates/TemplateReview.tsx`)
   - Reviewers can add comments
   - View existing review comments

5. **TemplateApproval** (`frontend/src/pages/Templates/TemplateApproval.tsx`)
   - Approvers can approve or reject templates
   - Requires password for e-signature
   - View previous approvals

### Integration with Document Creation
- Updated `CreateDocument.tsx` to include template selection
- When a template is selected, its HTML is preloaded into CKEditor
- Only published templates appear in the selection dropdown

### Routes (`frontend/src/App.tsx`)
- `/templates` - Template list
- `/templates/upload` - Upload template
- `/templates/:templateId/versions` - View versions
- `/templates/:templateId/versions/:versionId/review` - Review page
- `/templates/:templateId/versions/:versionId/approve` - Approval page

## Features

### Validation
- Optional required headings validation (e.g., Purpose, Scope, Responsibilities)
- Validated on submit-for-review and submit-for-approval
- Returns error if required headings are missing

### Audit Logging
Every workflow step is logged:
- `TEMPLATE_UPLOADED` - Template upload
- `TEMPLATE_SUBMITTED_FOR_REVIEW` - Submit for review
- `TEMPLATE_REVIEW_COMMENT_ADDED` - Review comment
- `TEMPLATE_SUBMITTED_FOR_APPROVAL` - Submit for approval
- `TEMPLATE_APPROVED` / `TEMPLATE_REJECTED` - Approval decision
- `TEMPLATE_PUBLISHED` - Template published
- `TEMPLATE_USED_FOR_DOCUMENT` - Template used to create document

### Permissions
- **Admin & Author**: Can upload templates
- **Reviewer & Admin**: Can review templates and add comments
- **Approver & Admin**: Can approve/reject templates
- **All authenticated users**: Can view published templates when creating documents

## Setup Instructions

### Backend
1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Run database migration:
   ```bash
   alembic upgrade head
   ```

3. Create storage directories (if not exists):
   ```bash
   mkdir -p storage/templates/originals
   mkdir -p storage/templates/previews
   mkdir -p storage/templates/images
   ```

### Frontend
1. Install dependencies (if needed):
   ```bash
   cd frontend
   npm install
   ```

2. The template service and pages are already integrated into the app.

## Usage Workflow

1. **Upload Template** (Admin/Author)
   - Navigate to Templates → Upload Template
   - Upload DOCX file
   - Template version created in DRAFT status

2. **Submit for Review** (Admin/Author)
   - View template versions
   - Click "Submit for Review" on draft version
   - Status changes to UnderReview

3. **Add Review Comments** (Reviewer/Admin)
   - Navigate to review page
   - Add comments
   - Submit for approval when ready

4. **Approve/Reject** (Approver/Admin)
   - Navigate to approval page
   - Enter password for e-signature
   - Approve or reject with comment

5. **Publish** (Approver/Admin)
   - After approval, template is automatically published
   - Published templates appear in document creation dropdown

6. **Use Template** (Author)
   - Create new document
   - Select published template from dropdown
   - Template HTML preloads into CKEditor
   - Author edits content normally

## Testing Checklist

- [ ] Upload DOCX template
- [ ] Verify DOCX to HTML conversion
- [ ] Verify image extraction
- [ ] Submit template for review
- [ ] Add review comments
- [ ] Submit for approval
- [ ] Approve template (with password)
- [ ] Reject template (with password)
- [ ] Publish template
- [ ] View published templates in document creation
- [ ] Create document from template
- [ ] Verify template HTML loads in CKEditor
- [ ] Verify audit logs are created
- [ ] Verify validation (required headings)

## Notes

- Only published templates can be used to create documents
- Template images are served via `/api/v1/templates/images/{filename}`
- HTML content is sanitized using bleach for security
- E-signature requires password verification for compliance
- All workflow steps are audited for FDA 21 CFR Part 11 compliance



