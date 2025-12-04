# Frontend Setup Guide

Complete guide to setting up and running the Pharma DMS frontend.

## 🎯 What's Included

The frontend provides a modern, responsive UI for all Phase 1 user stories:

✅ **Complete Components:**
- Login page with authentication
- Dashboard with stats and quick actions
- User list with search, filters, and pagination
- Create user form with validation
- Protected routes with RBAC
- Responsive layout with sidebar navigation
- API service layer with axios
- Authentication context with JWT

⚠️ **Components to Create** (templates provided in `FRONTEND_COMPONENTS.md`):
- EditUser.tsx - Edit user information
- UserDetail.tsx - View user profile details
- AuditLogs.tsx - View and filter audit logs

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router
- Axios
- Lucide icons
- date-fns

### Step 2: Configure Environment

The `.env.example` file is already created. Copy it:

```bash
cp .env.example .env
```

Content of `.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Step 3: Start Backend

**IMPORTANT:** The backend must be running first!

```bash
# In another terminal, from project root
cd backend
python run.py
```

Backend should be running on: http://localhost:8000

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will start on: http://localhost:3000

### Step 5: Login

Open http://localhost:3000 in your browser.

**Default Credentials:**
- Username: `admin`
- Password: `Admin@123456`

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx               ✅ Complete
│   │   └── ProtectedRoute.tsx       ✅ Complete
│   ├── context/
│   │   └── AuthContext.tsx          ✅ Complete
│   ├── pages/
│   │   ├── Login.tsx                ✅ Complete
│   │   ├── Dashboard.tsx            ✅ Complete
│   │   ├── AuditLogs.tsx            ⚠️  Need to create
│   │   └── Users/
│   │       ├── UserList.tsx         ✅ Complete
│   │       ├── CreateUser.tsx       ✅ Complete
│   │       ├── EditUser.tsx         ⚠️  Need to create
│   │       └── UserDetail.tsx       ⚠️  Need to create
│   ├── services/
│   │   ├── api.ts                   ✅ Complete
│   │   ├── auth.service.ts          ✅ Complete
│   │   ├── user.service.ts          ✅ Complete
│   │   └── audit.service.ts         ✅ Complete
│   ├── types/
│   │   └── index.ts                 ✅ Complete
│   ├── config/
│   │   └── api.ts                   ✅ Complete
│   ├── App.tsx                      ✅ Complete
│   ├── main.tsx                     ✅ Complete
│   └── index.css                    ✅ Complete
├── package.json                     ✅ Complete
├── tsconfig.json                    ✅ Complete
├── vite.config.ts                   ✅ Complete
├── tailwind.config.js               ✅ Complete
├── postcss.config.js                ✅ Complete
├── index.html                       ✅ Complete
└── README.md                        ✅ Complete
```

---

## ✨ Features

### 1. Authentication
- Secure login with JWT tokens
- Auto-redirect to login if not authenticated
- Token stored in localStorage
- Auto-logout on token expiration

### 2. Dashboard
- Welcome message with user info
- System statistics (for admins):
  - Total users
  - Active users
  - Audit log count
- Quick action buttons
- Role badges

### 3. User Management (Admin Only)
- **List Users:**
  - Paginated table view
  - Search by username, email, or name
  - Filter by role (Author, Reviewer, Approver, DMS_Admin)
  - Filter by status (Active/Inactive)
  - Real-time status badges
  - Last login timestamp
  
- **Create User:**
  - Form with validation
  - Username, email, password fields
  - First name, last name
  - Department, phone (optional)
  - Multi-role selection
  - Active status toggle
  - Password strength requirements

- **Actions:**
  - Activate/Deactivate users
  - Edit user details
  - View user profile
  - Delete user (with warning)

### 4. Role-Based Access Control
- Protected routes
- Admin-only pages
- Role-based UI elements
- Permission checks

### 5. Responsive Design
- Mobile-friendly sidebar
- Collapsible navigation
- Touch-friendly buttons
- Responsive tables

---

## 🎨 UI Components

### Buttons

```tsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-danger">Danger</button>
```

### Forms

```tsx
<div>
  <label className="label">Label</label>
  <input type="text" className="input" />
</div>
```

### Cards

```tsx
<div className="card">
  <h2>Card Title</h2>
  <p>Card content</p>
</div>
```

### Badges

```tsx
<span className="badge badge-green">Active</span>
<span className="badge badge-red">Inactive</span>
<span className="badge badge-blue">Admin</span>
```

---

## 🔌 API Services

### Auth Service

```typescript
import { authService } from '@/services/auth.service';

// Login
await authService.login({ username, password });

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();

// Check auth status
const isAuth = authService.isAuthenticated();
const isAdmin = authService.isAdmin();
const hasRole = authService.hasRole('Author');
```

### User Service

```typescript
import { userService } from '@/services/user.service';

// Get users
const users = await userService.getUsers({ 
  page: 1, 
  page_size: 20, 
  search: 'john',
  role: 'Author',
  is_active: true 
});

// Create user
const newUser = await userService.createUser(userData);

// Update user
const updated = await userService.updateUser(id, updateData);

// Activate/Deactivate
await userService.activateUser(id);
await userService.deactivateUser(id);

// Delete
await userService.deleteUser(id);
```

### Audit Service

```typescript
import { auditService } from '@/services/audit.service';

// Get logs
const logs = await auditService.getAuditLogs({
  page: 1,
  page_size: 50,
  action: 'USER_CREATED',
  start_date: '2024-01-01',
});

// Get available actions
const actions = await auditService.getActions();
```

---

## 📝 Creating Missing Components

### 1. EditUser Component

**File:** `frontend/src/pages/Users/EditUser.tsx`

Similar to CreateUser but:
- Load existing user data from API
- Pre-populate form fields
- Use `updateUser` API instead of `createUser`
- No password field (separate reset password flow)

**Template provided in:** `FRONTEND_COMPONENTS.md`

### 2. UserDetail Component

**File:** `frontend/src/pages/Users/UserDetail.tsx`

Display user information:
- Profile details (name, email, department, phone)
- Assigned roles
- Active status
- Created date
- Last login
- Action buttons (Edit, Reset Password, Activate/Deactivate)

### 3. AuditLogs Component

**File:** `frontend/src/pages/AuditLogs.tsx`

Table view with:
- List of audit log entries
- Columns: Timestamp, User, Action, Entity, Description
- Filters: Action type, Entity type, User, Date range
- Pagination
- Expandable details view

**After creating these components:**

1. Import them in `App.tsx`
2. Uncomment the corresponding routes
3. Test each component

---

## 🧪 Testing

### Manual Testing Checklist

1. **Login:**
   - [ ] Can login with valid credentials
   - [ ] Error message for invalid credentials
   - [ ] Redirects to dashboard after login

2. **Dashboard:**
   - [ ] Shows user profile
   - [ ] Shows statistics (admin only)
   - [ ] Quick actions work

3. **User List:**
   - [ ] Lists all users
   - [ ] Search works
   - [ ] Filters work
   - [ ] Pagination works

4. **Create User:**
   - [ ] Form validation works
   - [ ] Can create user successfully
   - [ ] Role selection works
   - [ ] Redirects after creation

5. **RBAC:**
   - [ ] Non-admin cannot access user management
   - [ ] Protected routes redirect to login
   - [ ] 403 error for insufficient permissions

---

## 🐛 Troubleshooting

### Issue: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Check backend CORS settings in `backend/app/main.py`
2. Verify `BACKEND_CORS_ORIGINS` includes http://localhost:3000
3. Restart backend after changes

### Issue: API Connection Failed

```
Network Error or Failed to fetch
```

**Solution:**
1. Verify backend is running: http://localhost:8000/health
2. Check `.env` file has correct API URL
3. Check browser console for exact error

### Issue: Blank Page

**Solution:**
1. Check browser console for errors
2. Verify all dependencies installed: `npm install`
3. Clear browser cache
4. Try: `rm -rf node_modules && npm install`

### Issue: Styling Not Working

**Solution:**
1. Verify Tailwind CSS is processing
2. Check `postcss.config.js` exists
3. Restart dev server: Stop and run `npm run dev` again

---

## 🎯 Next Steps

1. **Create Missing Components:**
   - Copy templates from `FRONTEND_COMPONENTS.md`
   - Create EditUser.tsx, UserDetail.tsx, AuditLogs.tsx
   - Uncomment routes in App.tsx
   - Test each component

2. **Enhance UI:**
   - Add loading states
   - Add success/error toasts
   - Add confirmation dialogs
   - Improve mobile responsiveness

3. **Add Features:**
   - Bulk user operations
   - Export audit logs to CSV
   - User avatar upload
   - Advanced filters

4. **Phase 2 Preparation:**
   - Document management components
   - File upload functionality
   - Workflow visualization
   - E-signature capture

---

## 📚 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| TypeScript | 5.3 | Type safety |
| Vite | 5.0 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| React Router | 6.21 | Routing |
| Axios | 1.6 | HTTP client |
| Lucide React | 0.307 | Icons |
| date-fns | 3.0 | Date formatting |

---

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Build output: `dist/` folder

Deploy to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Nginx
- Docker

---

## 📞 Support

- Check `frontend/README.md` for detailed documentation
- Review `FRONTEND_COMPONENTS.md` for component templates
- Backend API docs: http://localhost:8000/api/docs
- Main README: `README.md` in project root

---

**Status:** Core components complete, 3 components pending  
**Version:** 1.0.0  
**Phase:** 1 - User Management


