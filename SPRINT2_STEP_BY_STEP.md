# Sprint 2 Frontend - Step-by-Step Implementation

## 🎯 **Implementation Roadmap**

We'll build in **8 steps**, testing after each one:

1. ✅ **Services Layer** (API integration) - 30 min
2. ⏳ **Document List Page** (search & filters) - 20 min
3. ⏳ **CKEditor Wrapper** (basic editor) - 15 min
4. ⏳ **Editor Page** (load/edit document) - 20 min
5. ⏳ **Edit Locking** (acquire/release/heartbeat) - 20 min
6. ⏳ **Autosave** (10s intervals) - 15 min
7. ⏳ **Conflict Resolution** (409 handling) - 15 min
8. ⏳ **DOCX Export** (backend + UI) - 20 min

**Total Time: ~2.5 hours**

---

## 📋 **Prerequisites**

### **Install Packages:**
```bash
# Frontend
cd frontend
npm install

# Backend (if not done)
cd backend
pip install python-docx beautifulsoup4 lxml
```

### **Verify Backend is Running:**
```bash
cd backend
python run.py
```

Should see: `Application startup complete.` on http://localhost:8000

---

## 🚀 **STEP 1: Services Layer (API Integration)**

**Goal:** Create TypeScript services to communicate with backend APIs.

### **Files to Create:**
- `frontend/src/services/document.service.ts`
- `frontend/src/services/version.service.ts`
- `frontend/src/services/lock.service.ts`
- `frontend/src/services/attachment.service.ts`

### **What Each Service Does:**

1. **document.service.ts** - CRUD for documents (metadata)
   - Create document
   - List documents
   - Get document details
   - Update document
   - Search documents

2. **version.service.ts** - Version management
   - Create version (draft)
   - Get version content
   - Update version content
   - Save version (manual/auto)
   - List versions

3. **lock.service.ts** - Edit locking
   - Acquire lock
   - Refresh lock (heartbeat)
   - Release lock
   - Check lock status

4. **attachment.service.ts** - File uploads
   - Upload attachment
   - Download attachment
   - List attachments
   - Delete attachment

---

### **✅ Testing After Step 1:**

Open browser console (F12) and test:

```javascript
// Import service
import documentService from './services/document.service';

// Test create document
const doc = await documentService.create({
  title: 'Test Document',
  doc_number: 'DOC-001',
  department: 'QA'
});
console.log('Created:', doc);

// Test list documents
const docs = await documentService.list();
console.log('Documents:', docs);
```

**Expected:** Should see API responses in console.

---

## 🚀 **STEP 2: Document List Page**

**Goal:** Display all documents with search and filters.

### **Files to Create:**
- `frontend/src/pages/Documents/DocumentList.tsx`
- `frontend/src/pages/Documents/CreateDocument.tsx`

### **Features:**
- Table view of all documents
- Search by title/doc_number
- Filter by department/status
- Create new document button
- Click to open document

---

### **✅ Testing After Step 2:**

1. Navigate to `/documents`
2. Should see document list
3. Click "Create Document" → form appears
4. Fill form → document created
5. Search works
6. Filters work

---

## 🚀 **STEP 3: CKEditor Wrapper Component**

**Goal:** Create reusable CKEditor 5 component.

### **Files to Create:**
- `frontend/src/components/Editor/CKEditorWrapper.tsx`
- `frontend/src/components/Editor/EditorToolbar.tsx`

### **Features:**
- Rich text editor (bold, italic, headings)
- Lists (ordered, unordered)
- Tables
- Links
- Custom toolbar
- onChange callback

---

### **✅ Testing After Step 3:**

1. Create test page with editor
2. Should see CKEditor toolbar
3. Can type and format text
4. Can add headings
5. Can create lists
6. onChange fires when typing

---

## 🚀 **STEP 4: Editor Page (Load/Edit)**

**Goal:** Load document version and edit content.

### **Files to Create:**
- `frontend/src/pages/Documents/DocumentEditor.tsx`
- `frontend/src/hooks/useEditor.ts`

### **Features:**
- Load document by ID
- Load latest version content
- Display in CKEditor
- Track content changes
- Show document metadata

---

### **✅ Testing After Step 4:**

1. Navigate to `/documents/:id/edit`
2. Should load document
3. Should load version content in editor
4. Can edit content
5. Changes tracked in state

---

## 🚀 **STEP 5: Edit Locking**

**Goal:** Lock document for editing, prevent concurrent edits.

### **Files to Create:**
- `frontend/src/hooks/useLockHeartbeat.ts`
- `frontend/src/components/Editor/LockIndicator.tsx`

### **Features:**
- Acquire lock on edit
- Heartbeat every 15s to keep lock
- Lock indicator (who has lock)
- Release lock on exit
- Show error if locked by other user

---

### **✅ Testing After Step 5:**

1. Open document in editor
2. Should acquire lock
3. Lock indicator shows "Locked by You"
4. Open same document in incognito
5. Should show "Locked by admin"
6. Can't edit
7. Close first tab → lock released
8. Refresh incognito → can now edit

---

## 🚀 **STEP 6: Autosave**

**Goal:** Save content every 10 seconds automatically.

### **Files to Create:**
- `frontend/src/hooks/useAutosave.ts`
- `frontend/src/components/AutosaveIndicator.tsx`

### **Features:**
- Save every 10s
- Only save if content changed
- Show "Saving..." indicator
- Show "Saved" with timestamp
- Send lock token with save

---

### **✅ Testing After Step 6:**

1. Open editor
2. Type some content
3. Wait 10s
4. Should see "Saving..." → "Saved"
5. Check network tab → POST to save endpoint
6. Check backend audit logs → autosave recorded
7. Reload page → changes persisted

---

## 🚀 **STEP 7: Conflict Resolution**

**Goal:** Handle concurrent edit conflicts gracefully.

### **Files to Create:**
- `frontend/src/components/ConflictModal.tsx`
- Update version service to handle 409

### **Features:**
- Detect 409 Conflict error
- Show modal with options:
  - Refresh (discard local changes)
  - Force save (overwrite)
  - Cancel (keep editing)
- Display last saved info

---

### **✅ Testing After Step 7:**

1. Open document in 2 tabs (same user)
2. Edit in tab 1, save
3. Edit in tab 2, save
4. Should see conflict modal
5. Click "Refresh" → loads latest content
6. Try again with "Force Save"
7. Should overwrite with local content

---

## 🚀 **STEP 8: DOCX Export**

**Goal:** Export document to DOCX format.

### **Backend Files to Create:**
- `backend/app/utils/docx_export.py`
- `backend/app/api/v1/export.py`

### **Frontend Files to Create:**
- Add export button to DocumentEditor
- Download DOCX file

### **Features:**
- Convert HTML to DOCX
- Preserve formatting
- Download as file
- Include metadata (title, doc_number)

---

### **✅ Testing After Step 8:**

1. Open document in editor
2. Add formatted content (headings, lists)
3. Click "Export DOCX"
4. File downloads
5. Open in Word
6. Formatting preserved
7. Content matches editor

---

## 📋 **Progress Tracking**

After each step, mark it complete:

- [x] Step 1: Services Layer
- [ ] Step 2: Document List
- [ ] Step 3: CKEditor Wrapper
- [ ] Step 4: Editor Page
- [ ] Step 5: Edit Locking
- [ ] Step 6: Autosave
- [ ] Step 7: Conflict Resolution
- [ ] Step 8: DOCX Export

---

## 🎯 **Current Step: STEP 1 (Services Layer)**

**Ready to create the first service!**

I'll now create:
1. `document.service.ts` - Document CRUD
2. Test it together
3. Then create the other 3 services

**Let's go!** 🚀

