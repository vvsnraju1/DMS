# 📖 Document Management System - User Guide

## 🎯 **System Overview**

This is a **pharma-compliant Document Management System** for managing Standard Operating Procedures (SOPs) with full workflow, e-signatures, and audit trail.

---

## 👥 **User Roles & Permissions**

### **1. Regular User (No Special Roles)**
**What you can do:**
- ✅ View **Published documents** (official SOPs)
- ✅ Search and filter published documents
- ✅ Export documents as DOCX
- ❌ Cannot create or edit documents
- ❌ Cannot see work-in-progress documents

**Your Pages:**
- **Documents:** Browse official published SOPs
- **Dashboard:** Overview (basic)

---

### **2. Author**
**What you can do:**
- ✅ Everything Regular User can do, PLUS:
- ✅ **Create new documents**
- ✅ **Edit Draft documents**
- ✅ **Submit documents for review** (with e-signature)
- ✅ See your drafts in Pending Tasks
- ✅ View all your documents (all statuses)

**Your Pages:**
- **Pending Tasks:** See your Draft documents to work on
- **Documents:** See all your documents + published docs
- **Document Editor:** Edit content, autosave, manual save

**Your Workflow:**
1. Create document → Add content → Save
2. Submit for Review (password required)
3. Wait for reviewer feedback
4. If changes requested → Edit and resubmit

---

### **3. Reviewer**
**What you can do:**
- ✅ Everything Regular User can do, PLUS:
- ✅ **Review documents** submitted for review
- ✅ **Approve review** → Move to Pending Approval
- ✅ **Request changes** → Send back to Author with comments
- ✅ View content in read-only mode

**Your Pages:**
- **Pending Tasks:** See "Under Review" documents (HIGH priority)
- **Documents:** See published documents only
- **Document Detail:** Review and make decisions

**Your Workflow:**
1. Check Pending Tasks for "Review Required" items
2. Click task → Opens document
3. Click "View Content" to read in editor (read-only)
4. Go back to detail page
5. **Approve Review** (password + optional comments) OR
6. **Request Changes** (password + REQUIRED comments explaining what to fix)

---

### **4. Approver**
**What you can do:**
- ✅ Everything Regular User can do, PLUS:
- ✅ **Give final approval** to documents
- ✅ **Approve** → Move to ready for publish
- ✅ **Reject** → Send back to Author with reason
- ✅ View content in read-only mode

**Your Pages:**
- **Pending Tasks:** See "Pending Approval" documents (HIGH priority)
- **Documents:** See published documents only
- **Document Detail:** Final approval decisions

**Your Workflow:**
1. Check Pending Tasks for "Approval Required" items
2. Click task → Opens document detail
3. Review the content
4. **Approve** (password + optional comments) OR
5. **Reject** (password + REQUIRED reason)

---

### **5. DMS Admin (HOD)**
**What you can do:**
- ✅ **Everything** all other roles can do, PLUS:
- ✅ **Publish documents** (make them official)
- ✅ **Archive obsolete documents**
- ✅ **Manage users** (create, edit, deactivate)
- ✅ **View audit logs**
- ✅ See ALL documents (all statuses)
- ✅ See ALL pending tasks

**Your Pages:**
- **Dashboard:** System overview
- **Pending Tasks:** See everything (all statuses)
- **Documents:** Full document management
- **Users:** User management
- **Audit Logs:** Complete audit trail

**Your Workflow:**
1. Monitor all pending tasks
2. Can step in at any stage (review, approve)
3. **Final step:** Publish approved documents (password required)
4. Archive obsolete documents when needed

---

## 📄 **Using the Documents Page**

### **View Published Documents:**

1. Click **"Documents"** in sidebar
2. **You see:**
   - List of published (official) SOPs
   - Search bar
   - Department filter
   - Status filter (if Admin/Author)
3. **Search:** Type in search box to find documents
4. **Filter:** Select department to narrow results
5. **View:** Click "View" button → Opens document detail

### **Document Detail Page:**

**What you see:**
- Document title and metadata
- Current status badge
- Version information
- Action buttons (based on your role and document status)
- Version history
- Attachments section

**Available Actions:**
- **View Content:** Open editor in read-only mode
- **Export DOCX:** Download as Word file
- **Workflow buttons:** (if you have permission)
  - Submit for Review
  - Approve Review
  - Request Changes
  - Approve
  - Reject
  - Publish
  - Archive

---

## 📋 **Using Pending Tasks**

### **Your Personal Work Queue:**

1. Click **"Pending Tasks"** in sidebar
2. **See documents awaiting YOUR action:**
   - **Author:** Drafts to finish
   - **Reviewer:** Documents to review
   - **Approver:** Documents to approve
   - **Admin:** Everything

3. **Priority Tabs:**
   - **All Tasks:** Everything
   - **High Priority:** Reviews and approvals
   - **Medium Priority:** Ready to publish
   - **Low Priority:** Drafts

4. **Click on a task:**
   - Opens document detail page
   - Shows relevant action buttons
   - You can take action immediately

---

## ✍️ **Editing Documents**

### **Create New Document (Author/Admin):**

1. Documents page → **"Create Document"** button
2. Fill the form:
   - **Title:** Document name
   - **Doc Number:** e.g., SOP-QA-001
   - **Department:** Select from dropdown
   - **Description:** Brief summary
   - ✅ **Create initial draft:** Keep checked
3. Click **"Create & Start Editing"**
4. Editor opens → Start typing!

### **Editor Features:**

**Toolbar:**
- **Bold, Italic:** Format text
- **Headings:** H1, H2, H3
- **Lists:** Bullet points and numbered lists
- **Tables:** Insert tables
- **Links:** Add hyperlinks
- **Source:** View/edit HTML source

**Auto-Save:**
- ✅ Saves automatically every 10 seconds
- ✅ Indicator shows "Saving..." then "Saved just now"

**Manual Save:**
- ✅ Click "Save Now" button (top right)
- ✅ Forces immediate save

**Export:**
- ✅ Click "Export DOCX" button
- ✅ Downloads Word file with formatting

---

## 🔐 **E-Signature Process**

### **When You Need to Sign:**

Every **workflow action** (Submit, Approve, Reject, Publish) requires your password as an electronic signature.

### **E-Signature Modal:**

**What you see:**
1. **Blue lock icon** 🔒
2. **Action title** (e.g., "Approve Review")
3. **Explanation** of what will happen
4. **21 CFR Part 11 compliance notice**
5. **Comments field** (optional or required)
6. **Password field** (REQUIRED)
7. **Submit button**

**How to sign:**
1. Read the action description
2. Add comments if needed (or required)
3. **Enter YOUR password**
4. Click the action button
5. **Wait for "Success!"** message (green checkmark)
6. Modal auto-closes

**Important:**
- ✅ Password verifies your identity
- ✅ Action is recorded in audit trail
- ✅ Cannot be bypassed
- ✅ Compliant with 21 CFR Part 11

---

## 🔄 **Document Workflow States**

```
Draft
  ↓ (Author: Submit for Review)
Under Review
  ↓ (Reviewer: Approve Review)    OR    (Request Changes → back to Draft)
Pending Approval
  ↓ (Approver: Approve)            OR    (Reject → back to Draft)
Approved
  ↓ (Admin: Publish)
Published (Official!)
  ↓ (Admin: Archive - when obsolete)
Archived
```

---

## 📎 **Managing Attachments**

### **Upload Files:**

1. Open **document detail** page
2. Scroll to **"Attachments"** section
3. Click **"Upload File"** button
4. **Select file** (PDF, DOC, images, etc. - max 50MB)
5. **Add description** (optional)
6. Click **"Upload"**
7. Progress bar shows upload status

### **Download Files:**

1. Find attachment in list
2. Click **Download icon** (down arrow)
3. File downloads to your computer

### **Delete Files:**

1. Find attachment
2. Click **Trash icon** (if you can edit)
3. Confirm deletion

---

## 🔍 **Searching Documents**

### **Search Box:**
- Type document title or doc number
- Results update automatically
- Searches across: title, document_number

### **Department Filter:**
- Select from dropdown
- Shows only documents from that department

### **Status Filter (Admin/Author only):**
- Filter by workflow status
- Options: Draft, Under Review, Published, etc.

---

## 📊 **Audit Logs (Admin Only)**

### **View Activity:**

1. Click **"Audit Logs"** in sidebar
2. **See all system activity:**
   - User logins
   - Document creations
   - Workflow actions with e-signatures
   - User management actions

### **Search Audit Logs:**
- Search by username
- Search by action
- Search by entity (document number)
- Filter by date range

### **E-Signature Records:**

Each workflow action shows:
```
Action: VERSION_SUBMITTED
User: john.doe
Timestamp: 2025-12-01 15:42:27
Description: E-Signature: john.doe submitted version 1 of document 
SOP-QA-001 for review. Action authenticated with password 
(21 CFR Part 11 compliant).
```

---

## 💡 **Tips & Best Practices**

### **For Authors:**
- ✅ Write clear change summaries when submitting
- ✅ Use autosave (don't lose work)
- ✅ Add attachments for supporting documents
- ✅ Review content before submitting

### **For Reviewers:**
- ✅ Check Pending Tasks daily
- ✅ Provide specific comments when requesting changes
- ✅ Use "View Content" to read in detail

### **For Approvers:**
- ✅ Final quality check before approval
- ✅ Provide clear rejection reasons if needed
- ✅ Remember: Approved documents go to HOD for publishing

### **For Admins:**
- ✅ Monitor audit logs regularly
- ✅ Publish documents promptly after approval
- ✅ Archive obsolete documents
- ✅ Manage user roles appropriately

---

## 🆘 **Common Tasks**

### **"I need to create a new SOP"**
→ Documents → Create Document → Fill form → Start editing

### **"I need to review a document"**
→ Pending Tasks → Click "Review Required" task → View content → Approve/Request Changes

### **"I need to approve a document"**
→ Pending Tasks → Click "Approval Required" task → Review → Approve/Reject

### **"I need to publish a document"**
→ Pending Tasks → Click "Ready to Publish" → Publish (e-signature)

### **"I need to find a published SOP"**
→ Documents → Search or filter → Click "View"

### **"I need to download a document as Word"**
→ Open document detail → Click "Export DOCX"

### **"I need to see what changed"**
→ Open document detail → Scroll to "Version History"

---

## 🎊 **You're Ready!**

**Your Document Management System is fully operational and ready for use!**

**For more details, see:**
- **`FINAL_SYSTEM_READY.md`** - Complete system overview
- **`COMPLETE_WORKFLOW_TEST.md`** - Testing guide
- **`E_SIGNATURE_WORKFLOW_COMPLETE.md`** - E-signature details

**Happy document management!** 🚀

