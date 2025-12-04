# Sprint 2 Frontend Setup & Implementation

## 🎯 Overview

This guide covers implementing the complete frontend for Sprint 2, including:
- Syncfusion DocumentEditor integration
- Document list with search/filters
- Version management
- Edit locking with heartbeat
- Autosave functionality
- Conflict resolution
- DOCX import/export

---

## 📦 Step 1: Install Packages

```bash
cd frontend
npm install
```

This installs:
- `@syncfusion/ej2-react-documenteditor` - Main document editor
- Supporting Syncfusion packages for UI components
- All existing dependencies

**Time: ~2-3 minutes**

---

## 🔑 Step 2: Register Syncfusion License

### **Get a License Key:**

1. Go to: https://www.syncfusion.com/account/downloads
2. Sign up for a **free Community License** (for development/testing)
3. Download and get your license key
4. Or use trial key (30 days)

### **Add License to Your App:**

Create `frontend/src/syncfusion-license.ts`:

```typescript
import { registerLicense } from '@syncfusion/ej2-base';

// Replace with your actual license key
const SYNCFUSION_LICENSE_KEY = 'YOUR_LICENSE_KEY_HERE';

export function registerSyncfusionLicense() {
  registerLicense(SYNCFUSION_LICENSE_KEY);
}
```

**Update `frontend/src/main.tsx`** to register license on startup.

---

## 📁 Step 3: File Structure

```
frontend/src/
├── pages/
│   └── Documents/
│       ├── DocumentList.tsx          ✅ List/search documents
│       ├── DocumentEditor.tsx        ✅ Editor with Syncfusion
│       ├── DocumentDetail.tsx        ✅ Document metadata view
│       └── CreateDocument.tsx        ✅ Create new document
├── components/
│   ├── DocumentEditor/
│   │   ├── Editor.tsx                ✅ Syncfusion wrapper
│   │   ├── EditorToolbar.tsx         ✅ Custom toolbar
│   │   ├── LockIndicator.tsx         ✅ Lock status display
│   │   └── AutosaveIndicator.tsx     ✅ Autosave status
│   ├── VersionHistory.tsx            ✅ Version timeline
│   ├── ConflictModal.tsx             ✅ Conflict resolution UI
│   └── AttachmentManager.tsx         ✅ Upload/download files
├── services/
│   ├── document.service.ts           ✅ Document API calls
│   ├── version.service.ts            ✅ Version API calls
│   ├── lock.service.ts               ✅ Lock API calls
│   └── attachment.service.ts         ✅ Attachment API calls
├── hooks/
│   ├── useAutosave.ts                ✅ Autosave hook
│   ├── useLockHeartbeat.ts           ✅ Lock heartbeat hook
│   └── useDocumentEditor.ts          ✅ Editor state management
└── types/
    └── document.ts                    ✅ Document type definitions
```

---

## 🚀 Implementation Steps

### **Phase 1: Core Services (15 min)**
1. ✅ Create type definitions
2. ✅ Create API services
3. ✅ Test API integration

### **Phase 2: Document List (20 min)**
4. ✅ Create document list page
5. ✅ Add search and filters
6. ✅ Add create document flow

### **Phase 3: Syncfusion Integration (30 min)**
7. ✅ Register Syncfusion license
8. ✅ Create Editor wrapper component
9. ✅ Load/display document content
10. ✅ Add custom toolbar

### **Phase 4: Locking & Autosave (25 min)**
11. ✅ Implement lock acquisition
12. ✅ Implement lock heartbeat (15s interval)
13. ✅ Implement autosave (10s interval)
14. ✅ Add lock/save indicators

### **Phase 5: Advanced Features (20 min)**
15. ✅ Add conflict resolution modal
16. ✅ Add DOCX import/export
17. ✅ Add attachment manager
18. ✅ Add version history

### **Phase 6: Testing (15 min)**
19. ✅ Test complete workflow
20. ✅ Test concurrent editing
21. ✅ Test conflict resolution

**Total Time: ~2 hours**

---

## 🎨 UI Preview

### **Document List Page**
```
┌─────────────────────────────────────────────────────────┐
│  Documents                           [+ Create Document] │
├─────────────────────────────────────────────────────────┤
│  🔍 Search: [          ]  Department: [All ▼]           │
│     Status: [All ▼]      Tags: [        ]               │
├─────────────────────────────────────────────────────────┤
│  📄 SOP-QUAL-20251129-0001                     Draft    │
│     Quality Management SOP                               │
│     Created: 2025-11-29 | Versions: 2                   │
│                                          [View] [Edit]   │
├─────────────────────────────────────────────────────────┤
│  📄 SOP-SAFE-20251129-0002                     Draft    │
│     Safety Procedures Manual                             │
│     Created: 2025-11-29 | Versions: 1                   │
│                                          [View] [Edit]   │
└─────────────────────────────────────────────────────────┘
```

### **Document Editor Page**
```
┌─────────────────────────────────────────────────────────┐
│  🔒 Editing (Locked by you)  ⏱️ Autosaved 3s ago       │
│  [Save] [Export DOCX] [Import DOCX] [Versions]         │
├─────────────────────────────────────────────────────────┤
│  ┌─ Toolbar ──────────────────────────────────────────┐ │
│  │ [B] [I] [U] │ Font ▼ │ Size ▼ │ 🎨 │ ≡ │ 🔗 │ 📎 │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ Document Content ─────────────────────────────────┐ │
│  │ Quality Management SOP                              │ │
│  │                                                     │ │
│  │ 1. Purpose                                          │ │
│  │ This SOP defines the quality management...         │ │
│  │                                                     │ │
│  │ 2. Scope                                            │ │
│  │ This applies to all...                             │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  Version 2 (Draft) | Last saved: 10:45 AM                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Key Features to Implement

### **1. Edit Locking**
- Acquire lock on editor open
- Heartbeat every 15 seconds to keep lock alive
- Visual indicator showing lock status
- Auto-release lock on page close/unmount

### **2. Autosave**
- Save content every 10 seconds
- Only save if content changed
- Visual indicator: "Saving..." → "Saved"
- Don't spam audit logs (only log every 10th autosave)

### **3. Manual Save**
- Prominent Save button in toolbar
- Show success/error feedback
- Update last saved timestamp
- Log to audit trail

### **4. Conflict Resolution**
- Detect 409 Conflict response
- Show modal with options:
  - View current content
  - Overwrite with your changes
  - Refresh and merge manually
- Preserve user's work

### **5. DOCX Import/Export**
- Export: Use Syncfusion's built-in export
- Import: Upload DOCX, convert to SFDT/HTML
- Attach exported DOCX to version

---

## 📝 Testing Checklist

### **Document Management**
- [ ] Can create document
- [ ] Can list documents
- [ ] Can search documents
- [ ] Can filter by department/status

### **Editor**
- [ ] Editor loads with content
- [ ] Can format text (bold, italic, etc.)
- [ ] Can insert tables, lists
- [ ] Toolbar works correctly

### **Locking**
- [ ] Lock acquired on edit
- [ ] Lock indicator shows status
- [ ] Heartbeat extends lock
- [ ] Lock released on close
- [ ] Can't edit if locked by another user

### **Autosave**
- [ ] Content saved every 10s
- [ ] Indicator shows "Saving..." → "Saved"
- [ ] Only saves if content changed
- [ ] No excessive API calls

### **Manual Save**
- [ ] Save button works
- [ ] Success message shown
- [ ] Timestamp updated
- [ ] Audit log created

### **Conflict Resolution**
- [ ] Detects 409 conflict
- [ ] Modal appears with options
- [ ] Can view current version
- [ ] Can overwrite or refresh

### **DOCX**
- [ ] Can export DOCX
- [ ] File downloads correctly
- [ ] Can import DOCX
- [ ] Content preserved

### **Attachments**
- [ ] Can upload files
- [ ] Can download files
- [ ] Can view attachment list
- [ ] File size/type validation

---

## 🐛 Common Issues & Solutions

### **Issue 1: Syncfusion License Error**
```
Solution: Register license in main.tsx before rendering app
```

### **Issue 2: Editor Not Loading**
```
Solution: Import Syncfusion CSS in index.css
```

### **Issue 3: Heartbeat Stops**
```
Solution: Use useEffect cleanup to clear intervals
```

### **Issue 4: Autosave Too Frequent**
```
Solution: Use debounce and check if content actually changed
```

### **Issue 5: Lock Not Released**
```
Solution: Use beforeunload event and cleanup in useEffect
```

---

## 🎯 Next Steps

1. **Install packages**: `npm install`
2. **Get Syncfusion license**: Free Community License
3. **Follow implementation files** I'm about to create
4. **Test each feature** as you build
5. **Run end-to-end test** at the end

---

**Let's start implementing! I'll create all the necessary files now.** 🚀


