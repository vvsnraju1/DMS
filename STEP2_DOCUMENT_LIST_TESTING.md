# Step 2: Document List Page - Testing Guide

## ✅ **What We Just Created**

3 files for document listing and creation:

1. **`DocumentList.tsx`** (350 lines)
   - ✅ Document table view
   - ✅ Search by title/doc_number
   - ✅ Filter by department
   - ✅ Filter by status
   - ✅ Pagination (10 per page)
   - ✅ Status badges with colors
   - ✅ Created date/user display
   - ✅ Edit/View actions
   
2. **`CreateDocument.tsx`** (240 lines)
   - ✅ Form for new documents
   - ✅ Title, doc_number, department
   - ✅ Optional description
   - ✅ Option to create initial version
   - ✅ Validation
   - ✅ Auto-navigate to editor
   
3. **Updated `App.tsx` and `Layout.tsx`**
   - ✅ Routes for `/documents` and `/documents/create`
   - ✅ Navigation menu item
   - ✅ Active route highlighting

**Total: ~600 lines of clean UI code** ✅

---

## 🧪 **How to Test**

### **1. Start the Frontend**

```bash
cd frontend
npm run dev
```

Browser opens at: http://localhost:5173

---

### **2. Login**

- Username: `admin`
- Password: `Admin@123456`

---

### **3. Navigate to Documents**

**Method 1:** Click "**Documents**" in the sidebar

**Method 2:** Go to http://localhost:5173/documents

**Expected:**
- ✅ See "Documents" page
- ✅ "Create Document" button in top right
- ✅ Search bar and filters visible
- ✅ Empty state if no documents exist

---

### **4. Create Your First Document**

1. **Click "Create Document"** button

2. **Fill the form:**
   - **Title:** `Standard Operating Procedure - Equipment Cleaning`
   - **Doc Number:** `SOP-QA-001`
   - **Department:** Select `Quality Assurance`
   - **Description:** `Procedures for cleaning manufacturing equipment` *(optional)*
   - **Create initial draft:** ✅ Keep checked

3. **Click "Create & Start Editing"**

**Expected:**
- ✅ Document created
- ✅ Initial version created
- ✅ Redirects to editor page *(will fail for now, Step 3 will fix)*

**For now, you'll see a 404 or blank page - that's expected! The editor doesn't exist yet.**

---

### **5. Go Back to Document List**

Navigate back to http://localhost:5173/documents

**Expected:**
- ✅ See your new document in the table
- ✅ Status badge shows "Draft" (gray)
- ✅ Department shows "Quality Assurance"
- ✅ Version shows "v1.0"
- ✅ Created date/user displayed

---

### **6. Create More Test Documents**

Create a few more for testing filters:

**Document 2:**
- Title: `Batch Manufacturing Record Template`
- Doc Number: `BMR-PROD-001`
- Department: `Production`
- Uncheck "Create initial draft" to test metadata-only creation

**Document 3:**
- Title: `Quality Control Testing Protocol`
- Doc Number: `SOP-QC-001`
- Department: `Quality Control`

**Expected:**
- ✅ All documents appear in list
- ✅ Different departments shown
- ✅ Different statuses (if you created versions)

---

### **7. Test Search**

1. **Type in search box:** `Equipment`
2. **Expected:** Only "Equipment Cleaning" document shows

3. **Type:** `SOP`
4. **Expected:** All SOPs show

5. **Clear search** (X button or backspace)
6. **Expected:** All documents return

---

### **8. Test Department Filter**

1. **Select "Quality Assurance"** from Department dropdown
2. **Expected:** Only QA documents show

3. **Select "Production"**
4. **Expected:** Only Production documents show

5. **Select "All Departments"**
6. **Expected:** All documents return

---

### **9. Test Status Filter**

1. **Select "Draft"** from Status dropdown
2. **Expected:** Only Draft documents show

3. **Try other statuses** (most will be empty for now)

4. **Select "All Statuses"**
5. **Expected:** All documents return

---

### **10. Test Combined Filters**

1. **Search:** `SOP`
2. **Department:** `Quality Assurance`
3. **Expected:** Only QA SOPs show

4. **Click "Clear all"**
5. **Expected:** All filters reset, all documents show

---

### **11. Test Pagination** *(if you have >10 documents)*

If you created 10+ documents:
- ✅ "Next" button appears
- ✅ Clicking shows next page
- ✅ "Previous" button works
- ✅ Page numbers update

---

### **12. Test Row Actions**

1. **Click anywhere on a document row**
   - **Expected:** Should navigate to `/documents/{id}` (404 for now, we'll create detail page later)

2. **Click "Edit" button**
   - **Expected:** Should navigate to `/documents/{id}/edit` (404 for now, editor in Step 3)

3. **Click "View" button**
   - **Expected:** Should navigate to `/documents/{id}` (404 for now, detail page later)

---

### **13. Test Validation**

Go back to Create Document page:

1. **Leave Title empty, try to submit**
   - **Expected:** Error: "Title is required"

2. **Fill Title, leave Doc Number empty**
   - **Expected:** Error: "Document number is required"

3. **Leave Department unselected**
   - **Expected:** Error: "Department is required"

---

### **14. Test Backend Integration**

**Check Backend Logs:**

```bash
# In backend terminal
# You should see:
INFO:     POST /api/v1/documents/ - 200 OK
INFO:     POST /api/v1/document-versions/ - 200 OK
INFO:     GET /api/v1/documents/ - 200 OK
```

**Check Database:**

```bash
# Connect to PostgreSQL
psql -U postgres -d dms_db -p 5433

# List documents
SELECT id, title, doc_number, department, current_status FROM documents;

# List versions
SELECT id, document_id, version_number, workflow_status FROM document_versions;

# Exit
\q
```

**Expected:**
- ✅ Documents created in database
- ✅ Versions created (if option was checked)
- ✅ Audit logs recorded

---

### **15. Test Responsiveness**

1. **Resize browser window**
   - ✅ Table adapts
   - ✅ Filters stack on mobile
   - ✅ Buttons remain accessible

2. **Test on mobile** (F12 → Device Toolbar)
   - ✅ Search/filters work
   - ✅ Create button visible
   - ✅ Table scrollable

---

## 📋 **Verification Checklist**

After testing, verify:

**Document List:**
- [ ] Page loads without errors
- [ ] Empty state shows when no documents
- [ ] Documents display in table
- [ ] All columns show correct data
- [ ] Status badges have correct colors
- [ ] Created date formatted properly
- [ ] Created by user shown

**Search:**
- [ ] Search by title works
- [ ] Search by doc_number works
- [ ] Results update in real-time
- [ ] Clear search works

**Filters:**
- [ ] Department filter works
- [ ] Status filter works
- [ ] Combined filters work
- [ ] Clear all filters works
- [ ] Active filters displayed
- [ ] Can remove individual filters

**Pagination:**
- [ ] Shows correct page count
- [ ] Next/Previous work
- [ ] Page numbers accurate
- [ ] Results update correctly

**Create Document:**
- [ ] Form loads without errors
- [ ] All fields present
- [ ] Validation works
- [ ] Can create with version
- [ ] Can create without version
- [ ] Redirects after creation
- [ ] Cancel button works

**Navigation:**
- [ ] "Documents" link in sidebar
- [ ] Link highlights when active
- [ ] Can navigate back/forth
- [ ] Breadcrumbs work

---

## 🐛 **Common Issues**

### **Issue 1: "Documents" link not showing in sidebar**
**Solution:** Refresh browser, clear cache (Ctrl+Shift+R)

### **Issue 2: 404 after creating document**
**Expected!** The editor page doesn't exist yet (Step 3)

### **Issue 3: No documents showing**
**Check:**
1. Backend is running
2. Database has documents
3. Check browser console for errors
4. Check Network tab for API calls

### **Issue 4: Filters not working**
**Check:**
1. Console for JavaScript errors
2. Network tab - API calls should include query params
3. Backend logs for filter parameters

### **Issue 5: Search is slow**
**Expected** - No debouncing implemented yet (searches on every keystroke)

---

## ✅ **Step 2 Complete!**

**What works:**
- ✅ Document listing with table view
- ✅ Search by title/doc_number
- ✅ Filter by department/status
- ✅ Pagination
- ✅ Create document form
- ✅ Validation
- ✅ Navigation integration
- ✅ Responsive design

**What doesn't work yet:**
- ❌ Document editor (Step 3)
- ❌ Document detail page (Step 12)
- ❌ Edit locking (Step 5)
- ❌ Version history (Step 11)

---

## 🚀 **Next Step: CKEditor Wrapper**

Once you've tested the document list and it works, we'll create:

1. **CKEditor Wrapper Component** - Rich text editor
2. **DocumentEditor Page** - Full editing interface
3. **Load/save functionality** - Connect to backend

**Ready to proceed to Step 3?** Let me know if the document list is working! 🎯

