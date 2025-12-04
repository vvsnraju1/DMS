# 👥 User Management Guide

## 📋 **Complete User Management Features**

All user management features are now fully functional!

---

## 🎯 **How to Use Each Feature**

### **1. View All Users**
📍 **Location:** Sidebar → Users

**What you see:**
- List of all users with their details
- Search by username, email, or name
- Filter by Role (Author, Reviewer, Approver, DMS_Admin)
- Filter by Status (Active/Inactive)
- Action buttons for each user:
  - 👁️ **Eye icon** = View User Details
  - ✏️ **Edit icon** = Edit User
  - ❌ **X icon** = Deactivate User
  - ✅ **Check icon** = Activate User

---

### **2. Create New User**
📍 **Location:** Users page → "Create User" button

**Steps:**
1. Click **"Create User"** button (top right)
2. Fill in all required fields:
   - Username (unique)
   - Email (unique)
   - First Name
   - Last Name
   - Department (optional)
   - Phone (optional)
   - Initial Password
3. Select **at least one role** (checkboxes)
4. Choose if user should be active
5. Choose if they must change password on first login
6. Click **"Create User"**

**Result:** New user created + Audit log entry

---

### **3. View User Details**
📍 **Location:** Users list → Click 👁️ **Eye icon**

**What you see:**
- Full user profile:
  - Name, username, email
  - Department, phone
  - Account status (Active/Inactive)
  - All assigned roles
  - Created date, last updated, last login
  - Temporary password status

**Quick Actions Available:**
- **Edit User** button
- **Deactivate/Activate User** button
- **Reset Password** section (expandable form)

**To Reset Password from here:**
1. Click **"Reset Password"** button
2. Enter new password (min 8 chars)
3. Choose if user must change on next login
4. Click **"Reset"**
5. Password updated + Audit log created

---

### **4. Edit User**
📍 **Location:** Users list → Click ✏️ **Edit icon**

**What you can edit:**
- Email
- First Name, Last Name
- Department, Phone
- **Assigned Roles** (check/uncheck boxes)
- **Active Status** (checkbox)

**Cannot edit:**
- Username (read-only, shown but disabled)

**Steps:**
1. Click Edit icon (pencil) on any user
2. Modify any fields you want to change
3. Add/remove roles by checking/unchecking boxes
4. Toggle "Active Account" checkbox to activate/deactivate
5. Click **"Save Changes"**

**Result:** User updated + Audit log entry

---

### **5. Reset Password (2 Ways)**

#### **Method 1: From User Detail Page**
1. Click 👁️ Eye icon on a user
2. In the right sidebar, find **"Password Management"**
3. Click **"Reset Password"** button
4. Form expands with:
   - New password field (min 8 chars)
   - "Force change on next login" checkbox
5. Click **"Reset"**
6. Success message appears
7. User can now login with new password

#### **Method 2: From Edit User Page**
1. Click ✏️ Edit icon on a user
2. Look at the **right sidebar**
3. Find **"Password Management"** card
4. Click **"Reset Password"** button
5. Same form as above
6. Click **"Reset"**

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character

**Result:** Password reset + Audit log entry

---

### **6. Activate/Deactivate User (3 Ways)**

#### **Method 1: From User List**
- Click ❌ **X icon** to deactivate
- Click ✅ **Check icon** to activate
- Confirmation prompt appears
- Click "OK" to confirm

#### **Method 2: From User Detail Page**
- Click 👁️ Eye icon to open details
- Click **"Deactivate User"** or **"Activate User"** button
- Confirmation prompt appears
- Click "OK" to confirm

#### **Method 3: From Edit User Page**
- Click ✏️ Edit icon
- Uncheck/check **"Active Account"** checkbox
- Click **"Save Changes"**
- No confirmation needed (saves with other changes)

**Result:** User status changed + Audit log entry

---

## 🔐 **Password Management Details**

### **Force Password Change**
When resetting a password, you can choose:
- ✅ **Force change on next login** (checked by default)
  - User MUST change password after first login
  - More secure for initial setup
  
- ❌ **Don't force change**
  - User can use the password indefinitely
  - Use for emergency access

### **Temporary Password Indicator**
- Yellow warning shown if user has temporary password
- Visible in:
  - User Detail page
  - Edit User page
  - User List (if you add a column)

---

## 📊 **Audit Logs**

**Every action is logged:**
- ✅ User login/logout
- ✅ User created
- ✅ User updated
- ✅ User activated
- ✅ User deactivated
- ✅ Password reset
- ✅ Role changes

**View logs at:** Sidebar → Audit Logs

---

## 🎨 **User Interface Overview**

### **Users List Page**
```
┌─────────────────────────────────────────────────────────┐
│  Users                                  [+ Create User] │
├─────────────────────────────────────────────────────────┤
│  Filters: Search | Role | Status                        │
├─────────────────────────────────────────────────────────┤
│  User            | Roles      | Status  | Actions       │
│  ────────────────────────────────────────────────────── │
│  john_doe        | Author     | Active  | 👁️ ✏️ ❌    │
│  jane_smith      | Reviewer   | Active  | 👁️ ✏️ ❌    │
│  bob_wilson      | Approver   | Inactive| 👁️ ✏️ ✅    │
└─────────────────────────────────────────────────────────┘
```

### **User Detail Page**
```
┌────────────────────────────┬─────────────────────┐
│  John Doe                  │  Quick Actions      │
│  @john_doe                 │  [Edit User]        │
│  ────────────────────────  │  [Deactivate]       │
│  Contact Info:             │                     │
│  • Email: john@...         │  Password Mgmt      │
│  • Phone: ...              │  [Reset Password]   │
│  • Department: QA          │  > Form expands     │
│                            │                     │
│  Account Details:          │  Quick Info         │
│  • Created: ...            │  • User ID: 5       │
│  • Last Login: ...         │  • Roles: 2         │
│                            │  • Status: Active   │
│  Roles: [Author] [Reviewer]│                     │
└────────────────────────────┴─────────────────────┘
```

### **Edit User Page**
```
┌────────────────────────────┬─────────────────────┐
│  Edit User: john_doe       │  User Information   │
│  ────────────────────────  │  • User ID: 5       │
│  Username: john_doe (RO)   │  • Created: ...     │
│  Email: [john@example.com] │  • Updated: ...     │
│  First Name: [John]        │                     │
│  Last Name: [Doe]          │  Password Mgmt      │
│  Department: [QA]          │  [Reset Password]   │
│  Phone: [123-456-7890]     │  > Form expands     │
│                            │  > Enter new pwd    │
│  Roles:                    │  > Force change?    │
│  ☑ Author                  │  [Reset] [Cancel]   │
│  ☑ Reviewer                │                     │
│  ☐ Approver                │                     │
│  ☐ DMS_Admin               │                     │
│                            │                     │
│  ☑ Active Account          │                     │
│                            │                     │
│  [Save Changes] [Cancel]   │                     │
└────────────────────────────┴─────────────────────┘
```

---

## ✅ **Quick Reference**

| **Task** | **How To** | **Result** |
|----------|------------|------------|
| View all users | Sidebar → Users | List with search/filter |
| Create user | Users → Create User button | New user + audit log |
| View details | Click 👁️ eye icon | Full profile view |
| Edit user | Click ✏️ edit icon | Update info/roles |
| Reset password | Details or Edit → Reset Password | New password + audit log |
| Deactivate | Click ❌ X icon or Details → Deactivate | User cannot login |
| Activate | Click ✅ check icon or Details → Activate | User can login |
| View audit logs | Sidebar → Audit Logs | All system activities |

---

## 🚀 **Testing Checklist**

Test all features to ensure they work:

- [ ] Login as admin
- [ ] View users list
- [ ] Search for a user
- [ ] Filter by role
- [ ] Filter by status
- [ ] Click eye icon → view user details
- [ ] From details, click "Edit User"
- [ ] Edit user information
- [ ] Change user roles
- [ ] Save changes
- [ ] Go back to details
- [ ] Click "Reset Password"
- [ ] Enter new password
- [ ] Reset password
- [ ] Deactivate user
- [ ] Activate user
- [ ] Create a new user
- [ ] Go to Audit Logs
- [ ] See all actions logged
- [ ] Filter audit logs
- [ ] Logout and login with new user

---

## 🎉 **All Features Ready!**

You now have a complete user management system with:
- ✅ Full CRUD operations
- ✅ Role-based access control
- ✅ Password management
- ✅ Audit logging
- ✅ Search and filtering
- ✅ Activate/Deactivate
- ✅ User profile views

**Restart frontend to see all changes:**
```bash
cd frontend
npm run dev
```

Then test everything at http://localhost:3000! 🚀

