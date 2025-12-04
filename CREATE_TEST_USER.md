# Create Second Test User for Lock Testing

## Why You Need This

Test 15 requires trying to acquire a lock that's already held by **another user**. If you use the same admin account, it just refreshes the lock instead of failing.

---

## Option 1: Create Test User via API (Recommended)

### **Step 1: Create an Author User**

**POST** `http://localhost:8000/api/v1/users`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body:**
```json
{
  "username": "author1",
  "email": "author1@example.com",
  "password": "Author@12345",
  "first_name": "Test",
  "last_name": "Author",
  "department": "QA",
  "role_ids": [1],
  "is_active": true,
  "force_password_change": false
}
```

**Expected: 201 Created**

---

### **Step 2: Login as the New User**

**POST** `http://localhost:8000/api/v1/auth/login`

**Body:**
```json
{
  "username": "author1",
  "password": "Author@12345"
}
```

**Copy the new token** - save it as `token_author` in your environment

---

### **Step 3: Test 15 - Try to Acquire Lock with Different User**

**Scenario:**
1. Admin acquires lock on version 1 (Test 13) ✅
2. Author1 tries to acquire same lock (should fail) ❌

**POST** `http://localhost:8000/api/v1/documents/1/versions/1/lock`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_AUTHOR_TOKEN  (use author1's token, NOT admin's)
```

**Body:**
```json
{
  "timeout_minutes": 30,
  "session_id": "author-session-456"
}
```

**Expected Response: 423 Locked** ✅
```json
{
  "detail": "Version is currently locked by admin"
}
```

**Headers:**
```
X-Lock-Owner: admin
X-Lock-Expires: 2025-11-29T11:20:00.123456
```

---

## Option 2: Alternative Test (Same User Behavior)

If you want to test with the same user (admin), the current behavior is actually **correct**:

**Current Behavior (Idempotent):**
- Admin acquires lock → Gets lock ✅
- Admin acquires lock again → Refreshes lock ✅ (This is GOOD for UX)
- Different user acquires lock → Gets 423 error ❌

This prevents errors if the frontend accidentally calls acquire lock twice.

---

## Option 3: Modify Code to Always Fail on Duplicate

If you want Test 15 to fail even with the same user, change the code:

**File:** `backend/app/api/v1/edit_locks.py`

**Lines 100-105:** Change from:
```python
else:
    # User already owns the lock, refresh it
    existing_lock.refresh(extend_minutes=lock_request.timeout_minutes)
    db.commit()
    db.refresh(existing_lock)
    return _prepare_lock_response(existing_lock)
```

**To:**
```python
else:
    # User already owns the lock - still return error for testing
    raise HTTPException(
        status_code=status.HTTP_423_LOCKED,
        detail=f"Lock already acquired by you",
        headers={
            "X-Lock-Owner": existing_lock.user.username,
            "X-Lock-Expires": existing_lock.expires_at.isoformat()
        }
    )
```

---

## Recommended Approach

**I recommend Option 1** - Create a second user and test properly:

1. ✅ Admin acquires lock (Test 13)
2. ✅ Login as author1
3. ✅ Author1 tries to acquire lock (Test 15) → Should get 423 error

This tests the real scenario where different users compete for locks.

---

## Quick Commands for Option 1

```bash
# In Postman:

# 1. Create user (as admin)
POST /users
Token: admin token
Body: {"username": "author1", "email": "author1@example.com", "password": "Author@12345", "first_name": "Test", "last_name": "Author", "role_ids": [1]}

# 2. Login as new user
POST /auth/login
Body: {"username": "author1", "password": "Author@12345"}

# 3. Save new token as token_author

# 4. Try to acquire lock (should fail)
POST /documents/1/versions/1/lock
Token: author1 token
Expected: 423 Locked
```

---

## Summary

| Scenario | User 1 | User 2 | Result |
|----------|--------|--------|--------|
| Current Test 15 | admin acquires | admin acquires again | ✅ Refreshes (correct) |
| **Proper Test 15** | admin acquires | author1 acquires | ❌ 423 error (correct) |

For proper testing, **use two different users**! 🎯


