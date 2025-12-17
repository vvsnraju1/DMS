# Controlled Document Versioning - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- DMS backend and frontend already running
- User account with Author or Admin role
- At least one document already created

---

## Step 1: Run Database Migration

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using one)
# Windows:
myev\Scripts\activate
# Linux/Mac:
source myev/bin/activate

# Run migration
alembic upgrade head

# Verify migration
alembic current
# Should show: 007 (head)
```

**Note:** If you get a `DEBUG` boolean parsing error:
1. Open your `.env` file in the backend directory
2. Change `DEBUG=WARN` to `DEBUG=true`
3. Run migration again

---

## Step 2: Restart Services

### Restart Backend
```bash
# In backend directory
uvicorn app.main:app --reload
```

### Restart Frontend
```bash
# In frontend directory
npm run dev
```

---

## Step 3: Create Your First Versioned Document

### 3.1 Create a New Document
1. Navigate to **Documents** page
2. Click **"+ New Document"**
3. Fill in details:
   - Title: "Standard Operating Procedure - Equipment Cleaning"
   - Document Number: "SOP-QA-001"
   - Department: "Quality Assurance"
   - Check "Create initial draft version"
4. Click **"Create & Start Editing"**

### 3.2 Edit and Submit
1. CKEditor opens with version `v0.1` (Draft)
2. Write your document content
3. Click **"Save"** periodically
4. When done, click **"Submit for Review"**
   - Enter your password for e-signature
   - Click **"Submit"**

### 3.3 Review and Approve
1. **Reviewer** logs in and approves (Draft → Pending Approval)
2. **Approver** logs in and approves (Pending Approval → Approved)
3. **Admin** logs in and publishes (Approved → Effective)
   - Version changes from `v0.1` to `v1.0`
   - Status becomes **Effective**

✅ **You now have your first Effective document (v1.0)!**

---

## Step 4: Create a New Version

### 4.1 Open Effective Document
1. Go to **Documents** page
2. Click on your document "SOP-QA-001"
3. You should see:
   - Status: **Effective**
   - Version: **v1.0**
   - A **"Create New Version"** button (for Authors/Admins)

### 4.2 Create New Version
1. Click **"Create New Version"** button
2. A dialog opens with two options:

   **Option A: Minor Change** (v1.0 → v1.1)
   - Small updates, corrections, clarifications
   - Example: "Updated contact information in Section 5"
   
   **Option B: Major Change** (v1.0 → v2.0)
   - Significant revisions or structural changes
   - Example: "Complete restructure of safety procedures"

3. Select your change type (e.g., **Minor**)
4. Enter change reason (minimum 10 characters):
   ```
   Updated safety equipment list to reflect new OSHA regulations
   effective January 2025. Added PPE requirements for Section 3.
   ```
5. Click **"Create New Version"**

### 4.3 What Happens Next
- ✅ New version `v1.1` created as **Draft**
- ✅ Content cloned from `v1.0`
- ✅ `v1.0` remains **Effective** (not obsoleted yet)
- ✅ You're redirected to editor to make changes
- ✅ Full audit trail recorded

### 4.4 Edit the New Version
1. Make your changes in CKEditor
2. Save periodically
3. Submit for review when done
4. Follow the approval workflow

### 4.5 Publish New Version
1. After approval, Admin publishes `v1.1`
2. **Automatic Actions:**
   - ✅ `v1.1` becomes **Effective**
   - ✅ `v1.0` automatically marked as **Obsolete**
   - ✅ `v1.0.obsolete_date` recorded
   - ✅ `v1.0.replaced_by_version_id` = `v1.1`
   - ✅ Only `v1.1` is now Effective

---

## Step 5: View Version History

### 5.1 Access Version History
1. Open any document
2. Look for **"Version History"** tab or section
3. You'll see a timeline of all versions:

```
┌─────────────────────────────────────────────────┐
│ v1.1 [Effective] [Latest] [Minor Change]       │
│ Created by: John Doe | Dec 15, 2025, 10:30 AM  │
│ Change Reason: Updated safety equipment list   │
│                                                 │
│ [View] [New Version]                           │
├─────────────────────────────────────────────────┤
│ v1.0 [Obsolete]                                 │
│ Created by: John Doe | Nov 1, 2025, 09:00 AM   │
│ Obsoleted: Dec 15, 2025, 10:30 AM              │
│                                                 │
│ [View]                                          │
└─────────────────────────────────────────────────┘
```

### 5.2 Toggle Obsolete Versions
- By default, obsolete versions are hidden
- Check **"Show obsolete versions"** to see full history
- This helps keep the view clean while preserving audit trail

---

## Step 6: View an Obsolete Document

### 6.1 Open Obsolete Version
1. In Version History, click **"View"** on v1.0 (Obsolete)
2. You'll see:

```
┌─────────────────────────────────────────────────┐
│       ╱╲    OBSOLETE DOCUMENT    ╱╲            │
│     ╱    ╲  FOR REFERENCE ONLY ╱    ╲         │
│                                                 │
│ Was effective: Nov 1, 2025                     │
│ Obsoleted on: Dec 15, 2025                     │
│ Replaced by: v1.1                              │
└─────────────────────────────────────────────────┘

         OBSOLETE [Diagonal Watermark]

[Document content appears read-only with watermark overlay]

┌─────────────────────────────────────────────────┐
│ ⚠️ This is an obsolete version. Do not use for │
│ current operations. Refer to the latest        │
│ effective version.                              │
└─────────────────────────────────────────────────┘
```

### 6.2 Obsolete Version Rules
- ❌ **Read-only** - Cannot edit
- ❌ **Cannot delete** - Immutable for audit trail
- ❌ **Cannot publish** - Already superseded
- ✅ **Can view** - For reference and audit
- ✅ **Can export** - For historical records

---

## 🎯 Common Scenarios

### Scenario 1: Minor Update (Typo Fix)
```
Current: v1.0 (Effective)
Action: Create New Version → Minor Change
Reason: "Fixed typo in Section 2.3"
Result: v1.1 (Draft) → ... → v1.1 (Effective)
        v1.0 becomes Obsolete
```

### Scenario 2: Major Revision (Complete Rewrite)
```
Current: v1.9 (Effective)
Action: Create New Version → Major Change
Reason: "Complete restructure to align with ISO 9001:2015"
Result: v2.0 (Draft) → ... → v2.0 (Effective)
        v1.9 becomes Obsolete
```

### Scenario 3: Multiple Minor Updates
```
v1.0 → v1.1 → v1.2 → v1.3 → v2.0
Each minor update: typos, small additions, clarifications
Major update at v2.0: structural changes
```

### Scenario 4: Rejected Version
```
v1.0 (Effective) → v1.1 (Draft) → v1.1 (Rejected)
Action: Fix issues in v1.1, resubmit
Result: v1.1 (Draft) → ... → v1.1 (Effective)
Note: v1.0 stays Effective until v1.1 is published
```

---

## 📋 Checklist for Authors

Before creating a new version:
- [ ] Is the current version **Effective**?
- [ ] Is there no existing **Draft** version?
- [ ] Do I have a clear reason for the change? (10+ chars)
- [ ] Is it a **Minor** or **Major** change?
- [ ] Have I reviewed what will be changed?

Before submitting:
- [ ] Have I made all necessary changes?
- [ ] Have I saved the document?
- [ ] Have I reviewed the changes?
- [ ] Do I have my password ready for e-signature?

---

## 📋 Checklist for Admins

Before publishing:
- [ ] Is the version **Approved**?
- [ ] Have I reviewed the changes?
- [ ] Are there any blocking issues?
- [ ] Do I understand the impact of obsoleting previous versions?
- [ ] Have I informed stakeholders?

After publishing:
- [ ] Verify new version is **Effective**
- [ ] Verify old version is **Obsolete**
- [ ] Check audit log for completeness
- [ ] Notify relevant teams

---

## 🔧 Troubleshooting

### "Cannot create version from this document"
**Problem:** Document is not in Effective status  
**Solution:** Only create new versions from Effective documents

### "A draft version already exists"
**Problem:** There's already a Draft version for this document  
**Solution:** Complete or delete the existing draft first

### "Change reason too short"
**Problem:** Change reason less than 10 characters  
**Solution:** Provide a meaningful explanation (10-1000 chars)

### "Only one effective version allowed"
**Problem:** System preventing multiple effective versions  
**Solution:** This is normal behavior - publish will auto-obsolete old versions

### Obsolete watermark not showing
**Problem:** Component not imported or version status wrong  
**Solution:**
1. Check version status is exactly "Obsolete"
2. Import ObsoleteWatermark component
3. Check browser console for errors

---

## 🎓 Training Tips

### For Authors
1. **Think before creating**: Minor vs Major matters for version numbering
2. **Write good change reasons**: Future you will thank present you
3. **Don't rush**: Take time to make all changes in one version
4. **Ask for help**: Reviewers and Approvers are there to assist

### For Reviewers
1. **Check version history**: Understand what changed and why
2. **Verify change type**: Is it really Minor or should it be Major?
3. **Read change reason**: Does it match the actual changes?
4. **Leave comments**: Help authors improve the document

### For Approvers
1. **Review carefully**: Once approved and published, old version becomes obsolete
2. **Check compliance**: Ensure changes meet regulatory requirements
3. **Consider impact**: Who will be affected by this change?
4. **Document decisions**: Leave approval comments

### For Admins
1. **Monitor version history**: Keep an eye on versioning patterns
2. **Clean up drafts**: Remind authors to complete or delete stale drafts
3. **Audit regularly**: Review obsolescence logs
4. **Train users**: Ensure everyone understands the workflow

---

## 📞 Need Help?

### Questions?
- Check `CONTROLLED_VERSIONING_MODULE.md` for detailed documentation
- Review API documentation in `docs/API.md`
- Contact your DMS Administrator

### Found a Bug?
1. Note the exact error message
2. Record the steps to reproduce
3. Check browser console for errors
4. Report to your technical team with:
   - Document ID
   - Version ID
   - User role
   - Timestamp
   - Error details

---

## ✨ Best Practices

### Version Creation
- ✅ Create versions only when necessary
- ✅ Group related changes into one version
- ✅ Use Minor for small changes, Major for significant ones
- ✅ Write clear, concise change reasons
- ✅ Review old version before creating new one

### Version Management
- ✅ Keep version history clean
- ✅ Don't create multiple drafts
- ✅ Complete or reject drafts promptly
- ✅ Communicate with team about upcoming changes
- ✅ Plan major revisions carefully

### Compliance
- ✅ Always provide e-signature (password)
- ✅ Document all changes with reasons
- ✅ Maintain complete audit trail
- ✅ Never try to bypass controls
- ✅ Follow your organization's SOP for versioning

---

## 🎉 Success!

You now know how to:
- ✅ Create versioned documents
- ✅ Create new versions from effective documents
- ✅ Choose between Minor and Major changes
- ✅ View version history
- ✅ Understand obsolescence
- ✅ Navigate obsolete documents
- ✅ Follow best practices

**Welcome to controlled document versioning!**

---

**Last Updated**: December 15, 2025  
**Version**: 1.0  
**For**: DMS Users (All Roles)

