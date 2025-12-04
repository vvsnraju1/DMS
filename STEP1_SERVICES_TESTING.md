# Step 1: Services Layer - Testing Guide

## ✅ **What We Just Created**

4 TypeScript service files that handle ALL backend API communication:

1. **`document.service.ts`** (90 lines)
   - Create, list, get, update, delete documents
   - Search and filter functions
   
2. **`version.service.ts`** (130 lines)
   - Create, get, update versions
   - Save content (manual/autosave)
   - Submit, approve, reject, publish workflows
   
3. **`lock.service.ts`** (105 lines)
   - Acquire, refresh, release locks
   - Check lock status
   - Heartbeat helper
   
4. **`attachment.service.ts`** (155 lines)
   - Upload files with progress
   - Download files
   - Validate files
   - Format file sizes

**Total: ~480 lines of clean, typed service code** ✅

---

## 🧪 **How to Test Services**

### **Method 1: Browser Console (Quick Test)**

1. **Start frontend dev server:**
```bash
cd frontend
npm run dev
```

2. **Open browser:** http://localhost:5173

3. **Open DevTools Console:** Press `F12` → Console tab

4. **Login first** (to get auth token):
   - Login with: `admin` / `Admin@123456`
   - This sets the JWT token in localStorage

5. **Test in Console:**

```javascript
// Import the service (in a React component or DevTools)
// For quick test, we'll use the API directly

// Test 1: Create Document
fetch('http://localhost:8000/api/v1/documents/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    title: 'Test SOP Document',
    doc_number: 'SOP-001',
    department: 'Quality Assurance',
    description: 'Test document for CKEditor integration'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Document created:', data);
  window.testDocId = data.id; // Save for next tests
});

// Test 2: List Documents
fetch('http://localhost:8000/api/v1/documents/', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('✅ Documents:', data));

// Test 3: Create Version for Document
fetch('http://localhost:8000/api/v1/document-versions/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    document_id: window.testDocId, // Use the ID from Test 1
    version_number: 1,
    content_html: '<h1>Test Content</h1><p>This is a test document.</p>'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Version created:', data);
  window.testVersionId = data.id;
});

// Test 4: Acquire Lock
fetch('http://localhost:8000/api/v1/edit-locks/acquire', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    document_version_id: window.testVersionId,
    lock_duration_minutes: 30
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Lock acquired:', data);
  window.testLockToken = data.lock_token;
});

// Test 5: Save Content
fetch(`http://localhost:8000/api/v1/document-versions/${window.testVersionId}/content`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    content_html: '<h1>Updated Content</h1><p>Content updated via API!</p>',
    lock_token: window.testLockToken,
    is_autosave: false
  })
})
.then(r => r.json())
.then(data => console.log('✅ Content saved:', data));

// Test 6: Release Lock
fetch('http://localhost:8000/api/v1/edit-locks/release', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    lock_token: window.testLockToken
  })
})
.then(r => r.json())
.then(data => console.log('✅ Lock released:', data));
```

---

### **Method 2: Create Test Component (Proper Way)**

Create `frontend/src/pages/Test/ServiceTest.tsx`:

```typescript
import React, { useState } from 'react';
import documentService from '../../services/document.service';
import versionService from '../../services/version.service';
import lockService from '../../services/lock.service';

export default function ServiceTest() {
  const [results, setResults] = useState<string[]>([]);
  
  const log = (msg: string) => {
    setResults(prev => [...prev, msg]);
    console.log(msg);
  };

  const runTests = async () => {
    try {
      // Test 1: Create Document
      log('Testing document creation...');
      const doc = await documentService.create({
        title: 'Test Document',
        doc_number: 'SOP-TEST-001',
        department: 'QA'
      });
      log(`✅ Created document: ${doc.id}`);

      // Test 2: List Documents
      log('Testing document list...');
      const list = await documentService.list();
      log(`✅ Found ${list.total} documents`);

      // Test 3: Create Version
      log('Testing version creation...');
      const version = await versionService.create({
        document_id: doc.id,
        version_number: 1,
        content_html: '<h1>Test</h1>'
      });
      log(`✅ Created version: ${version.id}`);

      // Test 4: Acquire Lock
      log('Testing lock acquisition...');
      const lockResult = await lockService.acquire({
        document_version_id: version.id,
        lock_duration_minutes: 30
      });
      log(`✅ Acquired lock: ${lockResult.lock_token.substring(0, 10)}...`);

      // Test 5: Release Lock
      log('Testing lock release...');
      await lockService.release({ lock_token: lockResult.lock_token });
      log('✅ Lock released');

      log('🎉 All tests passed!');
    } catch (error: any) {
      log(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Service Layer Tests</h1>
      
      <button
        onClick={runTests}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Run Tests
      </button>

      <div className="mt-4 bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Results:</h2>
        {results.map((result, i) => (
          <div key={i} className="font-mono text-sm">{result}</div>
        ))}
      </div>
    </div>
  );
}
```

Then add route to `App.tsx`:

```typescript
import ServiceTest from './pages/Test/ServiceTest';

// In routes:
<Route path="/test-services" element={<ServiceTest />} />
```

Navigate to `http://localhost:5173/test-services` and click "Run Tests".

---

### **Expected Results**

**✅ Success looks like:**
```
Testing document creation...
✅ Created document: 1
Testing document list...
✅ Found 1 documents
Testing version creation...
✅ Created version: 1
Testing lock acquisition...
✅ Acquired lock: a1b2c3d4e5...
Testing lock release...
✅ Lock released
🎉 All tests passed!
```

**❌ Common Errors:**

1. **"Not authenticated"**
   - Solution: Make sure you're logged in first
   
2. **"Network Error"**
   - Solution: Check backend is running on port 8000
   
3. **"CORS Error"**
   - Solution: Backend CORS should already be configured for localhost:5173

---

## 📋 **Verification Checklist**

After testing, verify:

- [ ] **Document Service**
  - [ ] Can create document
  - [ ] Can list documents
  - [ ] Can get document by ID
  - [ ] Can search documents

- [ ] **Version Service**
  - [ ] Can create version
  - [ ] Can get version
  - [ ] Can save content
  - [ ] Can list versions

- [ ] **Lock Service**
  - [ ] Can acquire lock
  - [ ] Can check lock status
  - [ ] Can release lock
  - [ ] Token is returned

- [ ] **Attachment Service**
  - [ ] File validation works
  - [ ] Size formatting works
  - [ ] Service methods exist

---

## ✅ **Step 1 Complete!**

**What we have:**
- ✅ 4 complete service files
- ✅ ~480 lines of typed code
- ✅ All API endpoints covered
- ✅ Error handling included
- ✅ TypeScript types imported
- ✅ Ready for UI components

---

## 🚀 **Next Step: Document List Page**

Once you've tested the services and everything works, we'll create:

1. **DocumentList.tsx** - Display documents in a table
2. **CreateDocument.tsx** - Form to create new documents
3. **Search & Filters** - Find documents quickly

**Ready to proceed to Step 2?** Let me know if the services are working! 🎯

