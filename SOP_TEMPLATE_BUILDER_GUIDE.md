# No-Code SOP Template Builder - User Guide

## Overview
The SOP Template Builder is a user-friendly, no-code solution that allows Authors and Admins to create Standard Operating Procedure (SOP) templates without writing any code. Simply select the sections you want, edit content, and the system automatically generates a professional SOP template.

## Features

### ✅ Simple Section Selection
- Check/uncheck sections to include in your SOP
- Title Page and Signatory Table are always included
- All other sections are optional

### ✅ Rich Text Editing
- Each section opens in CKEditor for rich text editing
- Insert placeholders/tokens easily with the "Insert Placeholder" button
- Full formatting support (bold, italic, lists, tables, etc.)

### ✅ Drag & Drop Reordering
- Reorder sections using up/down arrows
- Sections automatically renumber based on order

### ✅ A4 Page Layout
- Preview matches MS Word A4 format
- Tables automatically fit full page width
- Professional document styling

### ✅ Auto-Generated Template Codes
- Template codes auto-generate based on category, department, and revision
- Format: `SP-DEPT-NUM-##` (e.g., `SP-QA-001-01`)

## How to Use

### Step 1: Create New SOP Template
1. Navigate to **Templates** → Click **"Create Template"**
2. Fill in the metadata fields:
   - **SOP Title** (required)
   - **SOP Number** (auto-generated if left empty)
   - **Revision** (required, e.g., "01")
   - **Effective Date** (optional)
   - **Next Review Date** (optional)
   - **Department** (required)
   - **CC Number** (optional)

### Step 2: Select Sections
1. In the **"Select SOP Sections"** panel, check the sections you want to include:
   - ✅ Purpose
   - ✅ Scope
   - ✅ Definitions / Abbreviations
   - ✅ Responsibility
   - ✅ Materials / Reagents
   - ✅ Equipment
   - ✅ Procedure
   - ✅ Safety Precautions
   - ✅ Records / Documentation
   - ✅ References
   - ✅ Annexures / Attachments

2. **Note:** Title Page and Signatory Table are always included

### Step 3: Edit Section Content
1. Scroll down to see enabled sections
2. Click on any section to expand it
3. Use CKEditor to edit the content:
   - Type or paste your content
   - Use formatting toolbar (bold, italic, lists, etc.)
   - Click **"Insert Placeholder"** to add tokens like `{{PURPOSE}}`, `{{PROCEDURE}}`, etc.

### Step 4: Reorder Sections
1. Use the **↑** (up) and **↓** (down) buttons to reorder sections
2. Sections automatically renumber based on their order

### Step 5: Preview
1. Click **"Preview"** button in the top right
2. View your SOP template in A4 format
3. Check that all sections appear correctly
4. Verify placeholders are showing

### Step 6: Save
1. Click **"Save Draft"** to save your template
2. Template is saved in **Draft** status
3. You can continue editing later

## Available Sections

### Always Included
- **Title Page** - Auto-generated with metadata (SOP Title, Number, Department, etc.)
- **Signatory Table** - Auto-generated with Prepared/Checked/Approved fields

### Optional Sections
1. **1.0 PURPOSE** - Purpose of the SOP
2. **2.0 SCOPE** - Scope and applicability
3. **3.0 DEFINITIONS / ABBREVIATIONS** - Terms and abbreviations used
4. **4.0 RESPONSIBILITY** - Who is responsible for what
5. **5.0 MATERIALS / REAGENTS** - Required materials and reagents
6. **6.0 EQUIPMENT** - Required equipment
7. **7.0 PROCEDURE** - Step-by-step procedure
8. **8.0 SAFETY PRECAUTIONS** - Safety measures and precautions
9. **9.0 RECORDS / DOCUMENTATION** - Required records and documents
10. **10.0 REFERENCES** - Reference documents and standards
11. **11.0 ANNEXURES / ATTACHMENTS** - List of annexures

## Placeholders/Tokens

### Metadata Tokens
- `{{TEMPLATE_TITLE}}` - SOP Title
- `{{TEMPLATE_CODE}}` - SOP Number
- `{{REVISION}}` - Revision number
- `{{EFFECTIVE_DATE}}` - Effective date
- `{{NEXT_REVIEW_DATE}}` - Next review date
- `{{DEPARTMENT}}` - Department name
- `{{CC_NUMBER}}` - CC Number

### Section Tokens
- `{{PURPOSE}}` - Purpose content
- `{{SCOPE}}` - Scope content
- `{{DEFINITIONS}}` - Definitions content
- `{{RESPONSIBILITY}}` - Responsibility content
- `{{MATERIALS}}` - Materials content
- `{{EQUIPMENT}}` - Equipment content
- `{{PROCEDURE}}` - Procedure content
- `{{SAFETY_PRECAUTIONS}}` - Safety precautions
- `{{RECORDS}}` - Records content
- `{{REFERENCES}}` - References content

### Signatory Tokens
- `{{SIGNATORY_PREPARED_NAME}}` - Prepared by name
- `{{SIGNATORY_PREPARED_DESIGNATION}}` - Prepared by designation
- `{{SIGNATORY_PREPARED_DEPARTMENT}}` - Prepared by department
- `{{SIGNATORY_PREPARED_DATE}}` - Prepared date
- `{{SIGNATORY_CHECKED_NAME}}` - Checked by name
- `{{SIGNATORY_CHECKED_DESIGNATION}}` - Checked by designation
- `{{SIGNATORY_CHECKED_DEPARTMENT}}` - Checked by department
- `{{SIGNATORY_CHECKED_DATE}}` - Checked date
- `{{SIGNATORY_APPROVED_NAME}}` - Approved by name
- `{{SIGNATORY_APPROVED_DESIGNATION}}` - Approved by designation
- `{{SIGNATORY_APPROVED_DEPARTMENT}}` - Approved by department
- `{{SIGNATORY_APPROVED_DATE}}` - Approved date

## Workflow

After creating and saving your template:

1. **Draft** → Template is saved, can be edited
2. **Submit for Review** → Template goes to reviewers
3. **Review** → Reviewers add comments or approve
4. **Approve** → Approvers approve the template
5. **Published** → Template becomes available for use

## Tips

1. **Start Simple**: Select only the sections you need
2. **Use Placeholders**: Insert placeholders where dynamic content will go
3. **Preview Often**: Use preview to see how the final document will look
4. **Save Regularly**: Save your work frequently
5. **Reorder Carefully**: Make sure sections are in the right order before finalizing

## Example Workflow

1. **Create Template** → Fill metadata
2. **Select Sections** → Check: Purpose, Scope, Procedure, Safety Precautions
3. **Edit Content** → Add content to each section with placeholders
4. **Reorder** → Ensure logical flow (Purpose → Scope → Procedure → Safety)
5. **Preview** → Check A4 layout and formatting
6. **Save Draft** → Save for later editing
7. **Submit for Review** → When ready, submit for approval

## Support

For questions or issues, contact your system administrator.








