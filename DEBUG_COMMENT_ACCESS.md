# 🔍 Debug: Comment Access Issue

## ❌ **Problem**
Blue banner only shows: "Read-Only Mode: This document is "Under Review" and cannot be edited"

**Missing:** "Select text to add comments."

This means `canComment()` is returning `false` → Your user doesn't have the right role!

---

## ✅ **Quick Fix Steps**

### **Step 1: Check Your Current User's Roles**

1. **Open Browser Console** (F12 → Console tab)

2. **Run this command:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Username:', user?.username);
console.log('Roles:', user?.roles);
console.log('Is Admin:', user?.is_admin);
```

3. **Check the output:**
   - What is your username?
   - What roles do you see?
   - Is `is_admin` true or false?

---

### **Step 2: Verify Expected Roles**

For commenting to work, the user MUST have one of these:
- ✅ `'Reviewer'` in roles array
- ✅ `'Approver'` in roles array  
- ✅ `is_admin: true`

**Example of WORKING user:**
```javascript
{
  username: "reviewer",
  roles: ["Reviewer"],  // ← HAS Reviewer role
  is_admin: false
}
```

**Example of NOT WORKING user:**
```javascript
{
  username: "author1",
  roles: ["Author"],  // ← Only Author, NO Reviewer/Approver
  is_admin: false
}
```

---

### **Step 3: Add the Role**

If your user is missing the role:

1. **Logout** from your current session

2. **Login as Admin** (admin / Admin@123456)

3. **Go to Users page**

4. **Find your user** (the one you want to comment with)

5. **Click "Edit"** or view user details

6. **Check the Role Checkboxes:**
   - ✅ Check **"Reviewer"** (for commenting on Under Review docs)
   - ✅ OR check **"Approver"** (for commenting on Pending Approval docs)
   - You can check BOTH if you want

7. **Click "Save"** or "Update User"

8. **Logout Admin**

9. **Login again** as your test user

10. **Refresh the page**

---

### **Step 4: Test Again**

After adding the role:

1. Open the document "Under Review"

2. Blue banner should now say:
   ```
   Read-Only Mode: This document is "Under Review" and cannot be edited. 
   Select text to add comments.
   ```

3. You should also see:
   - **"Comments (0)"** button in header
   - **Comment panel** on the right

4. Console should show:
   ```
   Text selection listener ADDED for commenting
   ```

---

## 🎯 **Common Mistakes**

### **Mistake 1: User only has "Author" role**
- Authors can EDIT documents
- Authors CANNOT comment
- You need Reviewer or Approver role

### **Mistake 2: No roles at all**
- User was created but no role assigned
- Go to Users page and assign a role

### **Mistake 3: Role was just added but not logged out**
- After adding a role, you MUST logout and login
- Refresh isn't enough
- The user object is cached in localStorage

### **Mistake 4: Wrong document status**
- Reviewers can comment on "Under Review"
- Approvers can comment on "Pending Approval"
- If document is "Draft" or "Published", commenting may be limited

---

## 🔬 **Advanced Debugging**

### **Check if Comment Button Exists**

Run in console:
```javascript
// Check if Comments button is in the DOM
const commentButton = document.querySelector('button:has(svg + text)');
const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent);
console.log('All buttons:', buttons);
console.log('Has Comments button:', buttons.some(b => b.includes('Comments')));
```

If "Comments" button doesn't exist → Role issue confirmed

---

### **Check canComment Function**

Add temporary debug to console:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
const canComment = () => {
  if (!user) {
    console.log('❌ No user');
    return false;
  }
  const result = user.roles?.includes('Reviewer') || user.roles?.includes('Approver') || user.is_admin;
  console.log('canComment check:', {
    hasReviewer: user.roles?.includes('Reviewer'),
    hasApprover: user.roles?.includes('Approver'),
    isAdmin: user.is_admin,
    result: result
  });
  return result;
};
canComment();
```

This will tell you exactly why `canComment()` is false.

---

## 📋 **Verification Checklist**

After fixing roles, verify:

- [ ] Console shows user with correct roles
- [ ] Blue banner includes "Select text to add comments"
- [ ] "Comments (0)" button visible in header
- [ ] Comment panel appears on right side
- [ ] Console shows "Text selection listener ADDED"
- [ ] Selecting text shows popup

---

## 🎓 **Role-Based Access Summary**

| **User Type** | **Roles** | **Can Edit** | **Can Comment** |
|---------------|-----------|--------------|-----------------|
| Admin | `is_admin: true` | ✅ Yes | ✅ Yes (anytime) |
| Author | `['Author']` | ✅ Yes (drafts) | ❌ No |
| Reviewer | `['Reviewer']` | ❌ No | ✅ Yes (Under Review) |
| Approver | `['Approver']` | ❌ No | ✅ Yes (Pending Approval) |
| Author + Reviewer | `['Author', 'Reviewer']` | ✅ Yes | ✅ Yes |

---

## 🛠️ **Create a Test Reviewer User**

If you don't have a reviewer yet:

1. **Login as Admin**

2. **Users → Create User**

3. **Fill in:**
   - Username: `test_reviewer`
   - Email: `test.reviewer@test.com`
   - Password: `Test@123456`
   - Full Name: `Test Reviewer`
   - **CHECK: ✅ Reviewer** (IMPORTANT!)
   - Active: Yes

4. **Click Create**

5. **Logout and login as test_reviewer**

6. **Go to Pending Tasks** → Should see documents

7. **Open document** → Should see commenting UI

---

## ✅ **Expected Output After Fix**

### **Console:**
```
User: {username: "test_reviewer", roles: ["Reviewer"], is_admin: false}
Text selection listener ADDED for commenting
```

### **UI:**
```
┌─────────────────────────────────────────┐
│ Blue Banner:                            │
│ Read-Only Mode: This document is        │
│ "Under Review" and cannot be edited.    │
│ Select text to add comments. ← THIS!    │
├─────────────────────────────────────────┤
│ Header: [Comments (0)] button ← THIS!   │
└─────────────────────────────────────────┘
```

---

**Run the Step 1 console command and share the output!** That will tell us exactly what role your user has. 🔍

