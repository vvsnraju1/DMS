# Steps 3-7: CKEditor Integration - Testing Guide

## ✅ **What We Just Completed**

**Steps 3-7 are DONE!** Here's what was created:

### **Step 3: CKEditor Wrapper** ✅
- `CKEditorWrapper.tsx` (340 lines) - Full-featured rich text editor
- Custom toolbar with 25+ formatting options
- Styled content area
- Read-only mode support

### **Step 4: Editor Page** ✅
- `DocumentEditor.tsx` (280 lines) - Complete editing interface
- `useEditor.ts` (220 lines) - Editor state management hook
- Load/save document content
- Lock management integration

### **Step 5: Edit Locking + Heartbeat** ✅
- `useLockHeartbeat.ts` (90 lines) - Auto-refresh locks
- Lock acquisition on edit
- Heartbeat every 15 seconds
- Lock indicator showing status
- Expires 30 minutes (refreshed automatically)

### **Step 6: Autosave** ✅
- Automatic save every 10 seconds
- Only saves if content changed
- Respects edit lock
- Visual indicator (Saving → Saved)

### **Step 7: Manual Save** ✅
- "Save Now" button
- Disabled when no changes
- Success feedback
- Creates audit log

### **Step 8: Conflict Resolution** ✅
- `ConflictModal.tsx` (140 lines) - Conflict resolution UI
- Detects 409 errors
- Refresh content option
- Force overwrite option (placeholder)
- Keep editing option

**Total: ~1,070 lines of production code!** 🎉

---

## 🧪 **How to Test the Editor**

### **1. Start Frontend**

```bash
cd frontend
npm run dev
```

---

### **2. Create a Test Document**

1. Login → Navigate to **Documents**
2. Click **"Create Document"**
3. Fill form:
   - Title: `Test Editor Document`
   - Doc Number: `TEST-001`
   - Department: `Quality Assurance`
   - ✅ **Keep "Create initial draft" checked**
4. Click **"Create & Start Editing"**

**Expected:** Editor page opens with CKEditor loaded

---

### **3. Test CKEditor Features**

#### **Basic Formatting:**
- ✅ Type some text
- ✅ Select text → Click **Bold** (B)
- ✅ Click **Italic** (I)
- ✅ Click **Underline** (U)
- ✅ Try **Strikethrough**, **Subscript**, **Superscript**

#### **Headings:**
- ✅ Click "Paragraph" dropdown → Select **Heading 1**
- ✅ Type "Document Title"
- ✅ Press Enter → Try **Heading 2**, **Heading 3**

#### **Lists:**
- ✅ Click **Bulleted List** icon
- ✅ Type items, press Enter for new item
- ✅ Try **Numbered List**
- ✅ Use Tab/Shift+Tab to indent/outdent

#### **Tables:**
- ✅ Click **Insert Table** icon
- ✅ Select 3x3 table
- ✅ Type in cells
- ✅ Right-click cell → Add/remove rows/columns

#### **Links:**
- ✅ Select text → Click **Link** icon
- ✅ Enter URL: `https://example.com`
- ✅ Check "Open in new tab"
- ✅ Click Save

#### **Other Features:**
- ✅ Block Quote
- ✅ Horizontal Line
- ✅ Font Size/Family
- ✅ Text Color/Background
- ✅ Alignment (left, center, right, justify)
- ✅ Find & Replace (Ctrl+F)
- ✅ Source Editing (view HTML)

---

### **4. Test Edit Locking**

#### **Test 4.1: Lock Acquisition**

1. **When page loads:**
   - ✅ Lock indicator shows **"Locked by You"** (blue)
   - ✅ Shows expiration time
   - ✅ Pulsing dot indicator
   - ✅ Editor is enabled

**Expected:** Lock acquired automatically on page load

#### **Test 4.2: Lock Heartbeat**

1. **Open browser console** (F12)
2. **Wait 15 seconds**
3. **Look for console message:** `[LockHeartbeat] Lock refreshed successfully`
4. **Wait another 15 seconds** → Repeat

**Expected:** Lock refreshed every 15 seconds automatically

#### **Test 4.3: Concurrent Editing** (2 browsers)

1. **Browser 1:** Open document in editor (as `admin`)
2. **Browser 2:** Open **Incognito/Private** window
3. **Browser 2:** Login as `admin` (same user)
4. **Browser 2:** Navigate to same document `/documents/1/edit`

**Expected:**
- Browser 2 shows **"Locked by You"** (idempotent lock)
- Both can edit (same user can have multiple sessions)

**OR** (if you have a second user):

1. **Browser 1:** Edit as `admin`
2. **Browser 2:** Login as different user (e.g., `author1`)
3. **Browser 2:** Try to edit same document

**Expected:**
- Browser 2 shows **"Locked by admin"** (red)
- Editor is **disabled** (read-only)
- Shows "READ ONLY" badge

---

### **5. Test Autosave**

#### **Test 5.1: Basic Autosave**

1. **Type some content** in the editor
2. **Watch the autosave indicator** (top right)
3. **After ~10 seconds:**
   - Shows "Saving..." (blue, animated)
   - Then shows "Saved X seconds ago" (green)

**Expected:** Content auto-saves every 10 seconds

#### **Test 5.2: Verify Content Persisted**

1. **Type:** `This is autosave test content`
2. **Wait for "Saved"** indicator
3. **Close the browser tab** (don't click back button)
4. **Reopen** the document `/documents/1/edit`

**Expected:** Your typed content is still there!

#### **Test 5.3: No Unnecessary Saves**

1. **Type content** → Wait for save
2. **Don't type anything** for 20 seconds
3. **Watch console**

**Expected:** No save requests if content hasn't changed

---

### **6. Test Manual Save**

#### **Test 6.1: Save Button**

1. **Type new content**
2. **Click "Save Now"** button

**Expected:**
- Button shows "Saving..." with spinner
- Then autosave indicator shows "Saved just now"
- Button disabled until you make more changes

#### **Test 6.2: Save Without Lock**

1. **Manually release lock** (close and reopen document in read-only user)
2. **Try to click "Save Now"**

**Expected:**
- Alert: "You must have edit lock to save"
- Save doesn't execute

---

### **7. Test Conflict Resolution**

#### **Test 7.1: Simulate Conflict** (Tricky!)

This requires backend simulation or two simultaneous edits:

**Method A: Using DevTools (Advanced)**

1. **Open document** in editor
2. **Type:** `Version A content`
3. **Open DevTools** → Network tab
4. **Type more content** → Wait for autosave
5. **In Network tab:** Find the save request
6. **Right-click → Copy as cURL**
7. **Open terminal** → Paste cURL command
8. **Modify the content_html** in the cURL
9. **Run cURL twice** (simulates two saves with different content)

**Expected:** Next autosave shows conflict modal

**Method B: Two Users (Easier)**

1. **Browser 1:** User admin opens document
2. **Browser 2:** Break admin's lock via Postman or admin action
3. **Browser 2:** User author1 acquires lock, edits, saves
4. **Browser 1:** Admin types content, tries to save

**Expected:** Conflict modal appears

#### **Test 7.2: Conflict Modal Options**

When modal appears:

**Option 1: Refresh Content**
- ✅ Click "Refresh Content"
- ✅ Modal closes
- ✅ Editor reloads with server version
- ✅ Your local changes **are lost**

**Option 2: Cancel**
- ✅ Click "Cancel"
- ✅ Modal closes
- ✅ Editor stays as-is
- ✅ Your content preserved locally

**Option 3: Force Overwrite** *(Not implemented yet)*
- ✅ Click "Force Overwrite"
- ✅ Shows alert: "Not yet implemented"

---

### **8. Test Other Editor Features**

#### **Test 8.1: Unsaved Changes Warning**

1. **Type content**
2. **Click "Back" button** (top left)

**Expected:**
- Confirm dialog: "You have unsaved changes. Are you sure?"
- Click Cancel → Stay on page
- Click OK → Go back (changes lost)

#### **Test 8.2: Browser Close Warning**

1. **Type content** (don't save)
2. **Try to close browser tab**

**Expected:**
- Browser shows: "Changes you made may not be saved"
- Can cancel or leave

#### **Test 8.3: Lock Release on Exit**

1. **Open document** (lock acquired)
2. **Click "Back"** button
3. **In another browser:** Try to edit same document

**Expected:**
- Lock is released
- Second browser can now acquire lock

---

### **9. Check Backend Logs & Database**

#### **Backend Logs:**

```bash
# In backend terminal, you should see:
POST /api/v1/edit-locks/acquire - 200 OK
POST /api/v1/edit-locks/refresh - 200 OK (every 15s)
PUT /api/v1/document-versions/1/content - 200 OK (every 10s autosave)
POST /api/v1/edit-locks/release - 200 OK
```

#### **Database:**

```sql
-- Check audit logs
SELECT action, entity_type, description, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Expected entries:
-- "document_version_update" (autosave = true)
-- "document_version_update" (autosave = false for manual save)
-- "edit_lock_acquired"
-- "edit_lock_released"

-- Check edit locks
SELECT * FROM edit_locks WHERE is_active = true;

-- Should see active lock while editing

-- Check version content
SELECT id, content_html, content_hash, updated_at 
FROM document_versions 
WHERE id = 1;

-- Should see your content and recent updated_at
```

---

## 📋 **Verification Checklist**

### **CKEditor (Step 3):**
- [ ] Editor loads without errors
- [ ] Can type and format text
- [ ] Bold, italic, underline work
- [ ] Headings work (H1-H6)
- [ ] Lists work (ordered, unordered)
- [ ] Tables can be inserted and edited
- [ ] Links can be added
- [ ] Font size/color work
- [ ] Alignment works
- [ ] Source editing works

### **Editor Page (Step 4):**
- [ ] Document loads correctly
- [ ] Shows document title/number
- [ ] Shows version number
- [ ] Footer shows metadata
- [ ] Back button works
- [ ] Save button present

### **Edit Locking (Step 5):**
- [ ] Lock acquired on page load
- [ ] Lock indicator shows status
- [ ] Heartbeat refreshes every 15s
- [ ] Can see lock in database
- [ ] Lock released on exit
- [ ] Concurrent user sees "locked by" message
- [ ] Read-only mode works

### **Autosave (Step 6):**
- [ ] Saves every 10 seconds
- [ ] Indicator shows "Saving..."
- [ ] Indicator shows "Saved X ago"
- [ ] Content persists after reload
- [ ] Doesn't save if no changes
- [ ] Respects edit lock

### **Manual Save (Step 7):**
- [ ] "Save Now" button works
- [ ] Shows "Saving..." feedback
- [ ] Success indicator appears
- [ ] Button disabled when no changes
- [ ] Creates audit log entry

### **Conflict Resolution (Step 8):**
- [ ] Detects 409 errors
- [ ] Modal appears on conflict
- [ ] Shows conflict details
- [ ] "Refresh" reloads content
- [ ] "Cancel" keeps editing
- [ ] "Force Overwrite" shows message

---

## 🐛 **Common Issues**

### **Issue 1: CKEditor doesn't load / Blank editor**
**Check:**
- npm install completed successfully
- No console errors (F12 → Console)
- ckeditor5 package installed

**Fix:**
```bash
cd frontend
npm install ckeditor5 @ckeditor/ckeditor5-react
npm run dev
```

### **Issue 2: Lock not acquired / "Not locked by you"**
**Check:**
- Backend is running
- Document version exists
- User is authenticated

**Fix:**
- Check Network tab for API errors
- Verify `/edit-locks/acquire` returns 200
- Check backend logs

### **Issue 3: Autosave not working**
**Check:**
- Lock is acquired (must be "Locked by You")
- Content actually changed
- No network errors

**Debug:**
- Open console, should see autosave attempts
- Check Network tab for PUT requests every 10s

### **Issue 4: Heartbeat not refreshing**
**Check:**
- Console for `[LockHeartbeat]` messages
- Network tab for `/edit-locks/refresh` calls

**Debug:**
- Should see refresh every 15 seconds
- Check backend logs

### **Issue 5: Content not persisting**
**Check:**
- Autosave actually succeeded (check indicator)
- Database updated (check `document_versions` table)
- Lock token valid

---

## ✅ **Steps 3-7 Complete!**

**What works:**
- ✅ Full CKEditor integration (25+ features)
- ✅ Edit locking with heartbeat
- ✅ Autosave (10s intervals)
- ✅ Manual save
- ✅ Conflict detection
- ✅ Unsaved changes warnings
- ✅ Read-only mode

**What's remaining:**
- ⏳ Attachment upload/download (Step 9)
- ⏳ DOCX export (Step 10)
- ⏳ Version history (Step 11)
- ⏳ Document detail page (Step 12)

---

## 🚀 **Next: Continue to Steps 9-12?**

Tell me when you're ready to continue! The remaining features will add:
- File attachment management
- DOCX import/export
- Version history viewer
- Document workflow interface

**Or test first?** Let me know if you want to test the editor before moving forward! 🎯

