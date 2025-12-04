# 🔍 Comment System Troubleshooting Guide

## ✅ **Fixed: View Content Button**

The "View Content" button was opening in a new window, which can cause issues. **This has been fixed** - it now navigates properly.

---

## 📋 **Step-by-Step Testing**

### **Step 1: Verify Your User Has the Right Role**

1. Login as **Admin** (admin / Admin@123456)
2. Go to **Users** page
3. Find or create a **Reviewer** user:
   - Username: `reviewer`
   - Email: `reviewer@test.com`
   - Password: `Reviewer@123`
   - **Role: Reviewer** (IMPORTANT!)
   - Full Name: `Test Reviewer`
   - Click **Create User**

---

### **Step 2: Create/Submit a Test Document**

1. Still as **Admin**, go to **Documents**
2. Click **Create Document**:
   - Title: `Comment Test Doc`
   - Document Number: `COM-001`
   - Department: `Quality`
   - Description: `Testing comments`
   - Click **Create and Start Editing**

3. Add some content in the editor:
   ```
   Quality Control Process
   
   This is a test document for reviewing inline comments.
   
   Section 1: Introduction
   The quality control process ensures all products meet standards.
   
   Section 2: Inspection
   All materials must be inspected before use.
   ```

4. Click **Save Now**
5. Click **Back** to go to document list
6. Click **View** on your document
7. Click **Submit for Review**
8. Enter password: `Admin@123456`
9. Comments: `Ready for review testing`
10. Click **Submit**
11. Status should change to **"Under Review"** ✅

---

### **Step 3: Login as Reviewer and Test Comments**

1. **Logout** (top right corner)
2. **Login as Reviewer:**
   - Username: `reviewer`
   - Password: `Reviewer@123`

3. **Go to Pending Tasks:**
   - Click **"Pending Tasks"** in the left sidebar
   - You should see the document under "Reviews Required"

4. **Open the Document:**
   - Click on the document title
   - This opens the **DocumentDetail** page
   - You should see document info and a **"View Content"** button

5. **Click "View Content":**
   - The page should navigate to the editor (NOT open in new tab)
   - The editor should open in **read-only mode**

---

### **Step 4: Check What You Should See**

When the editor opens, you should see:

#### ✅ **Top of Page:**
- Document title: "Comment Test Doc"
- Blue banner saying **"Read-Only Mode: This document is 'Under Review' and cannot be edited. You can review the content and add comments by selecting text."**
- Header with buttons:
  - **"Comments (0)"** button (blue if panel is open)
  - **"Export DOCX"** button

#### ✅ **Right Side:**
- **Comment Panel** should appear automatically
- Shows "Comments" header
- Says "No comments yet" with instructions

#### ✅ **Main Area:**
- Document content (read-only)
- You CANNOT type or edit

---

### **Step 5: Test Text Selection**

1. **Open Browser Console** (F12 → Console tab)

2. **Check for logs:**
   - You should see: `"Text selection listener ADDED for commenting"`
   - If you see `"NOT added"`, there's a problem with your role

3. **Select text in the document:**
   - Click and **drag** to select: `"Quality Control Process"`
   - **Release the mouse**

4. **Check Console Logs:**
   - Should see: `"Text selected: Quality Control Process"`
   - Should see: `"Selection rect: [object]"`
   - Should see: `"Comment popover should show"`

5. **Check for Popup:**
   - A **popup** should appear below your selected text
   - It should show:
     - Title: "💬 Add Comment"
     - Selected text in yellow box
     - Text area for your comment
     - "Add Comment" and "Cancel" buttons

---

## 🐛 **If Not Working - Debug Checklist**

### **Problem: "Text selection listener NOT added"**

**Check the console log details:**

```
Text selection listener NOT added. canComment: false, isLockedByMe: false
```

**Solution:**
- `canComment: false` means you don't have Reviewer/Approver role
- Go to Users page (as admin) and verify your user has **Reviewer** role
- Logout and login again after changing role

---

### **Problem: No popup when selecting text**

**Check console logs when you select text:**

1. If you see **nothing** when selecting:
   - The event listener didn't attach
   - Check: `canComment: true` in the logs
   - Check: Document status is "Under Review" or "Pending Approval"

2. If you see `"Text selected: [text]"` but no popup:
   - Selection was detected but popup didn't render
   - Check browser console for errors
   - Check if `CommentPopover` component has errors

---

### **Problem: Comment panel not showing**

**If the right panel is empty:**

1. Check the header for **"Comments (N)"** button
2. Click it to toggle the panel
3. If button doesn't exist:
   - `canComment()` is returning false
   - Check your role again

---

### **Problem: "Cannot read properties of undefined (reading 'roles')"**

**Solution:**
- The user object isn't loaded
- Check: `localStorage.getItem('user')` in console
- If null, login again
- Check: `localStorage.getItem('access_token')` in console

---

## 🔬 **Manual Console Testing**

Open browser console (F12) and run these commands:

```javascript
// 1. Check if user is loaded
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Roles:', user?.roles);

// 2. Check if user has Reviewer role
const hasReviewer = user?.roles?.includes('Reviewer');
console.log('Has Reviewer role:', hasReviewer);

// 3. Check token
const token = localStorage.getItem('access_token');
console.log('Has token:', !!token);

// 4. Test text selection manually
document.addEventListener('mouseup', () => {
  const sel = window.getSelection();
  console.log('Selected:', sel?.toString());
});
```

---

## 📸 **What Working Looks Like**

### **Console Logs (When Working):**
```
Text selection listener ADDED for commenting
[mouseup detected]
Text selected: Quality Control Process
Selection rect: DOMRect {x: 123, y: 456, width: 200, height: 20, ...}
Comment popover should show
```

### **UI (When Working):**
```
┌─────────────────────────────────────────────┬──────────────┐
│ Header with "Comments (0)" button          │              │
├─────────────────────────────────────────────┤              │
│ Blue Banner: "Read-Only Mode..."           │              │
├─────────────────────────────────────────────┤   Comment    │
│                                             │     Panel    │
│  Document Content (read-only)               │              │
│                                             │  "No comments│
│  [When text selected]                       │   yet..."    │
│  ┌─────────────────────────┐               │              │
│  │ 💬 Add Comment      [X] │               │              │
│  ├─────────────────────────┤               │              │
│  │ Selected: "Quality..."  │               │              │
│  ├─────────────────────────┤               │              │
│  │ [Your comment here...]  │               │              │
│  │ [Add] [Cancel]          │               │              │
│  └─────────────────────────┘               │              │
│                                             │              │
└─────────────────────────────────────────────┴──────────────┘
```

---

## 🔧 **Quick Fixes**

### **Fix 1: Clear Everything and Start Fresh**
```javascript
// In browser console:
localStorage.clear();
// Then reload page and login again
```

### **Fix 2: Verify Roles in Database**
```sql
-- In PostgreSQL:
SELECT u.username, u.email, r.role_name 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'reviewer';
```

### **Fix 3: Add Reviewer Role Manually**
As admin:
1. Users → Find reviewer user → Click Edit
2. Check **"Reviewer"** checkbox
3. Click Save
4. Logout reviewer and login again

---

## 📞 **Still Not Working?**

Share these details:

1. **Console logs** when you:
   - Open the document
   - Select text

2. **User info:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('user')));
   ```

3. **Browser console errors** (red text)

4. **Document status:** (Draft / Under Review / Pending Approval / Published)

5. **Your role:** (Admin / Author / Reviewer / Approver)

---

## ✅ **Expected Success**

When everything works:
1. ✅ Login as Reviewer
2. ✅ Open document "Under Review"
3. ✅ See blue "Read-Only" banner
4. ✅ See "Comments" button in header
5. ✅ See Comment Panel on right
6. ✅ Console shows "Text selection listener ADDED"
7. ✅ Select text → Popup appears
8. ✅ Add comment → Appears in right panel
9. ✅ Can resolve/edit/delete comments

**Test it again now with the View Content button fix!** 🚀

