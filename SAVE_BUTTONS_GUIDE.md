# 💾 Save Buttons Guide - Document vs Comments

## 🎯 **Two Different Save Workflows**

### **1. Comments = Auto-Save** ✅
- Comments save **automatically** when you add them
- No save button needed for comments
- Each comment saves to database immediately

### **2. Document Content = Manual Save** 💾
- Document edits need **"Save Document"** button
- For Admins and Authors who are editing
- Saves the actual document text/content

---

## 📋 **What You'll See Now**

### **When Editing (Admin/Author with lock):**

```
Header Buttons:
┌────────────────────────────────────────────┐
│ [💬 Comments (3)]  [💾 Save Document]     │
│                     ↑ Green button         │
└────────────────────────────────────────────┘
```

**"Save Document" button:**
- **Green** color (to distinguish from blue comments button)
- Shows when you have the edit lock
- Saves your document text changes
- Disabled if no unsaved changes
- Shows "Saving Document..." when saving

---

### **When Reviewing (Reviewer/Approver, read-only):**

```
Header Buttons:
┌────────────────────────────────────────────┐
│ [💬 Comments (3)]  [✓ Done Reviewing]     │
│                     ↑ Green button         │
└────────────────────────────────────────────┘
```

**"Done Reviewing" button:**
- **Green** color
- Shows when you're in read-only mode
- Finishes your review session
- Warns if you have unresolved comments
- Takes you back to document detail page

---

## 🎨 **Complete UI Layout**

### **For Admins Editing:**

```
┌──────────────────────────────────────────────────┬─────────────┐
│ Header:                                          │             │
│ [← Back] Document Title                          │             │
│ [💬 Comments (2)] [💾 Save Document] [📥 Export]│             │
│                    ↑ Saves document content      │             │
├──────────────────────────────────────────────────┤  Comment    │
│ 💡 Green Tip: You can select text to comment    │   Panel     │
├──────────────────────────────────────────────────┤             │
│                                                  │ - Comment 1 │
│  CKEditor (EDITABLE)                             │ - Comment 2 │
│  [You can type and edit]                         │             │
│                                                  │ [Each comment│
│  [Select text → Add comment]                     │  auto-saves]│
│                                                  │             │
└──────────────────────────────────────────────────┴─────────────┘
```

**Workflow:**
1. Edit document text
2. Add comments by selecting text (auto-saves)
3. Click **"Save Document"** to save text changes
4. Both document and comments are saved!

---

### **For Reviewers (Read-Only):**

```
┌──────────────────────────────────────────────────┬─────────────┐
│ Header:                                          │             │
│ [← Back] Document Title                          │             │
│ [💬 Comments (2)] [✓ Done Reviewing] [📥 Export]│             │
│                    ↑ Finish reviewing            │             │
├──────────────────────────────────────────────────┤  Comment    │
│ Blue Banner: Read-Only Mode                      │   Panel     │
│ Select text to add comments                      │             │
├──────────────────────────────────────────────────┤             │
│                                                  │ - Comment 1 │
│  CKEditor (READ-ONLY)                            │ - Comment 2 │
│  [Cannot edit text]                              │             │
│                                                  │ [Each comment│
│  [Select text → Add comment]                     │  auto-saves]│
│                                                  │             │
└──────────────────────────────────────────────────┴─────────────┘
```

**Workflow:**
1. Read document (cannot edit)
2. Select text → Add comments (auto-saves)
3. Resolve/edit comments as needed (auto-saves)
4. Click **"Done Reviewing"** when finished
5. Returns to document detail page

---

## 💡 **Understanding the Difference**

### **Document Saves (Manual):**
```
What: Document TEXT content
Who: Admin, Author (when editing)
When: Click "Save Document" button
How: Requires edit lock
Where: Saved to document_versions.content_html
```

### **Comment Saves (Automatic):**
```
What: Individual comments
Who: Admin, Reviewer, Approver
When: Immediately when you click "Add Comment"
How: No lock needed
Where: Saved to document_comments table
```

---

## 📊 **Save Button Matrix**

| **User Role** | **Mode** | **Button Shown** | **What It Saves** |
|---------------|----------|------------------|-------------------|
| Admin | Editing | 💾 Save Document | Document content |
| Author | Editing | 💾 Save Document | Document content |
| Admin | Reviewing | ✓ Done Reviewing | Nothing (exits review) |
| Reviewer | Reviewing | ✓ Done Reviewing | Nothing (exits review) |
| Approver | Reviewing | ✓ Done Reviewing | Nothing (exits review) |

**Note:** Comments auto-save for all roles!

---

## 🎯 **Use Cases**

### **Use Case 1: Admin Editing & Commenting**

1. Admin opens document for editing
2. Types: "This is a quality procedure"
3. Selects "quality" → Adds comment "Check SOP-001"
   - Comment auto-saves ✅
4. Continues typing more content
5. Clicks **"Save Document"**
   - Document content saves ✅
6. Both document text AND comments are saved!

---

### **Use Case 2: Reviewer Adding Comments**

1. Reviewer opens document (read-only)
2. Reads content, selects text
3. Adds comment "Please clarify this section"
   - Comment auto-saves ✅
4. Adds 3 more comments
   - Each auto-saves ✅
5. Clicks **"Done Reviewing"**
   - Returns to document detail
   - All comments already saved!

---

### **Use Case 3: Reviewer with Unresolved Comments**

1. Reviewer adds 5 comments
2. Resolves 3 of them
3. Clicks **"Done Reviewing"**
4. Alert: "You have 2 unresolved comment(s). Are you sure?"
5. Can cancel to keep reviewing
6. Or confirm to exit anyway

---

## 🚀 **Testing the Save Buttons**

### **Test 1: Save Document (Admin/Author)**

1. Login as Admin
2. Create or edit a document
3. Type some content
4. **Check:** "Save Document" button is visible (green)
5. **Check:** Button is enabled (not grayed out)
6. Click "Save Document"
7. **Check:** Button shows "Saving Document..."
8. **Check:** Button becomes disabled after save
9. Edit text again
10. **Check:** Button becomes enabled again

---

### **Test 2: Add Comment (No Save Needed)**

1. While editing, select text
2. Add a comment
3. **Check:** Popup shows "Saving..."
4. **Check:** Popup closes automatically
5. **Check:** Comment appears in panel
6. **Check:** "Save Document" button still there
7. Make more document edits
8. **Check:** Still need to click "Save Document" for edits

---

### **Test 3: Done Reviewing (Reviewer)**

1. Login as Reviewer
2. Open document "Under Review"
3. Add 2-3 comments
4. **Check:** "Done Reviewing" button visible (green)
5. Click it
6. If comments unresolved: Alert appears
7. Confirm
8. **Check:** Returns to document detail page
9. **Check:** Comments are still there (saved)

---

## ⚠️ **Important Notes**

### **For Admins/Authors:**
- ✅ "Save Document" saves your TEXT edits
- ✅ Comments auto-save separately
- ✅ You need to do BOTH:
  1. Add comments (auto-saves)
  2. Click "Save Document" (saves text)

### **For Reviewers/Approvers:**
- ✅ Comments auto-save as you add them
- ✅ "Done Reviewing" just closes the editor
- ✅ All your comments are already saved
- ✅ You don't need to "save" anything manually

---

## 🎨 **Visual Indicators**

### **Save Document Button States:**

```
✅ Enabled (has changes):
[💾 Save Document]  ← Green, clickable

⏳ Saving:
[🔄 Saving Document...]  ← Spinner animation

❌ Disabled (no changes):
[💾 Save Document]  ← Grayed out, not clickable
```

---

### **Done Reviewing Button:**

```
Always enabled:
[✓ Done Reviewing]  ← Green, always clickable

With unresolved comments:
Click → "⚠️ You have 2 unresolved comment(s). Continue?"
```

---

## 🐛 **Troubleshooting**

### **Problem: Don't see any save button**

**Check:**
- Are you in read-only mode? (Should see "Done Reviewing")
- Are you editing? (Should see "Save Document")
- Refresh the page

---

### **Problem: Save Document button is grayed out**

**Reason:** No unsaved changes detected

**Solution:**
- Type something in the document
- Button should become enabled
- Or you're already saved (no changes to save)

---

### **Problem: Done Reviewing doesn't save my work**

**Understanding:**
- Your comments are ALREADY saved!
- "Done Reviewing" just closes the editor
- Check the document detail page - comments are there

---

## ✅ **Quick Reference**

| **What You Want** | **What To Do** |
|-------------------|----------------|
| Save document text | Click "💾 Save Document" (green) |
| Save a comment | Nothing! Auto-saves when you add it |
| Finish reviewing | Click "✓ Done Reviewing" (green) |
| Save comment edits | Nothing! Auto-saves when you edit |
| Resolve a comment | Nothing! Auto-saves when you resolve |

---

## 🎉 **Summary**

**Now you have:**
- ✅ **"Save Document"** button (green) for document content
- ✅ **"Done Reviewing"** button (green) for finishing review
- ✅ **Auto-save** for all comments
- ✅ Clear visual distinction (green vs blue)
- ✅ Different buttons for different modes

**No confusion!** 
- Editing? → Save Document button
- Reviewing? → Done Reviewing button
- Comments? → Always auto-save!

**Test it now!** Open a document and you'll see the appropriate save button! 💾✨

