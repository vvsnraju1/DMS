# 🚀 Quick Start - Test the Comment System (5 Minutes)

## ✅ **Prerequisites**
- Database migration applied ✅
- Backend running on port 8000
- Frontend running on port 3000/3001

---

## 📝 **5-Minute Test**

### **1. Start Services** (if not running)

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

### **2. Create Test Document** (As Admin)

1. Open browser: `http://localhost:3000` (or 3001)
2. Login: `admin` / `Admin@123456`
3. Click **"Documents"** → **"Create Document"**
4. Fill in:
   - Title: `Test Comment System`
   - Document Number: `TST-001`
   - Department: `Quality`
   - Description: `Testing inline comments`
5. Click **"Create and Start Editing"**
6. In editor, type some content:
   ```
   This is a test document for the comment system.
   
   Quality Control Process:
   - Step 1: Inspection
   - Step 2: Testing
   - Step 3: Approval
   
   Compliance Requirements:
   - FDA guidelines must be followed
   - ISO standards apply
   ```
7. Click **"Save Now"**
8. Click **"Back"** to go to documents page
9. Click **"View"** on your test document
10. Click **"Submit for Review"**
11. Enter password: `Admin@123456`
12. Add comments: `Ready for reviewer feedback`
13. Click **"Submit"**
14. Status should change to **"Under Review"** ✅

---

### **3. Add Comments** (As Reviewer)

1. **Logout** (top right)
2. You need a Reviewer user. If you don't have one, create it:
   - Login as admin
   - Go to **"Users"** → **"Create User"**
   - Username: `reviewer`
   - Email: `reviewer@test.com`
   - Password: `Reviewer@123`
   - Role: **Reviewer**
   - Click **"Create User"**
   - Logout

3. **Login as Reviewer:**
   - Username: `reviewer`
   - Password: `Reviewer@123`

4. **Go to Pending Tasks:**
   - Click **"Pending Tasks"** in sidebar
   - You should see "Test Comment System" under "Reviews Required"

5. **Open Document:**
   - Click on the document
   - Click **"Edit"** or open from Pending Tasks
   - Document opens in **read-only mode**
   - **Comment Panel** appears on the right! 🎉

6. **Add Your First Comment:**
   - In the document, **select text**: `"Quality Control Process"`
   - A **popup** should appear!
   - Type comment: `Please add more details about each QC step`
   - Click **"Add Comment"**
   - Comment appears in right panel! ✅

7. **Add More Comments:**
   - Select text: `"FDA guidelines"`
   - Comment: `Which specific FDA regulation applies?`
   - Select text: `"ISO standards"`
   - Comment: `Reference ISO 9001:2015`

8. **View Comments:**
   - All 3 comments should be visible in the right panel
   - Each shows:
     - Your name
     - Timestamp (e.g., "2 minutes ago")
     - Quoted text (in yellow box)
     - Your comment text
     - Resolve button

---

### **4. Manage Comments**

**As Reviewer (still):**

1. **Edit a Comment:**
   - Click **"Edit"** button on any comment
   - Change the text
   - Click **"Save"**

2. **Delete a Comment:**
   - Click **"Delete"** (trash icon) on a comment
   - Confirm deletion

3. **Resolve a Comment:**
   - Click **"Resolve"** button on a comment
   - Comment gets grayed out with "Resolved" badge

4. **Toggle Comment Panel:**
   - Click **"Comments (N)"** button in header
   - Panel hides
   - Click again to show

---

### **5. Test as Admin**

1. **Logout** and **Login as Admin** again
2. Open the same document
3. In comment panel:
   - Admin can **edit ANY comment** (not just own)
   - Admin can **delete ANY comment**
   - Try editing a reviewer's comment
   - Try deleting it

---

### **6. Test Workflow Integration**

**As Reviewer:**
1. Review all comments
2. Click **"Approve Review"** or **"Request Changes"**
3. Enter password: `Reviewer@123`
4. Add workflow comments
5. Submit

**Check Audit Logs (as Admin):**
1. Go to **"Audit Logs"**
2. Search for "COMMENT"
3. You should see:
   - `COMMENT_CREATED`
   - `COMMENT_UPDATED`
   - `COMMENT_DELETED`
   - With user, timestamp, details

---

## ✅ **Success Checklist**

After testing, you should have verified:
- [ ] Document opens in read-only mode for reviewers
- [ ] Text selection shows comment popup
- [ ] Comment saves with quoted text
- [ ] Comment appears in right panel
- [ ] Comment panel shows all comments
- [ ] Can resolve comments
- [ ] Can edit own comments
- [ ] Can delete own comments
- [ ] Admin can manage all comments
- [ ] Comments persist after page refresh
- [ ] Comment count shows in header button
- [ ] Audit logs record comment actions

---

## 🐛 **Troubleshooting**

### **Popup Not Showing:**
- Are you logged in as Reviewer/Approver?
- Is document in read-only mode? (not Draft status)
- Did you actually **select** text (not just click)?

### **Comment Panel Empty:**
- Check browser console for errors
- Verify backend is running and accessible
- Check if comments were actually saved

### **Cannot Add Comment:**
- Check your role (must be Reviewer/Approver)
- Document must be in correct status
- Check backend logs for errors

### **Comments Not Persisting:**
- Check database connection
- Verify migration was applied: `alembic current`
- Check backend logs for SQL errors

---

## 📊 **Expected Results**

After following this guide, you should have:
- ✅ 1 test document
- ✅ 2-3 comments with highlighted text
- ✅ Comment panel working
- ✅ Resolve/Edit/Delete working
- ✅ Audit logs showing comment activity
- ✅ Full understanding of the feature

---

## 🎓 **Next Steps**

Now that comments are working:
1. Test with **Approver** role too
2. Try commenting on different document statuses
3. Test multiple reviewers commenting simultaneously
4. Check how comments behave when document is published
5. Test comment notifications (if implemented)

---

## 📸 **What You Should See**

### **In DocumentEditor (Read-Only Mode):**
- Blue banner: "Read-Only Mode: This document is 'Under Review' and cannot be edited. You can review the content and add comments."
- Comment button in header: "Comments (3)" 
- Right panel with comment list
- CKEditor content (read-only)

### **When Selecting Text:**
- Popup appears centered below selection
- Shows quoted text in yellow box
- Text input for comment
- "Add Comment" and "Cancel" buttons

### **In Comment Panel:**
- Header with comment icon and count
- List of comments (newest first)
- Each comment card shows:
  - Author avatar (blue circle)
  - Name and timestamp
  - Quoted text (yellow background)
  - Comment text
  - Action buttons (Resolve, Edit, Delete)

---

**🎉 Happy Testing! The comment system is fully functional! 📝✨**

Need help? Check `COMMENT_SYSTEM_GUIDE.md` for detailed documentation.

