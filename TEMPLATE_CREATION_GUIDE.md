# Step-by-Step Guide: Creating an SOP Template

This guide will help you create a Standard Operating Procedure (SOP) template similar to the one you uploaded, using the Template Builder.

## Accessing the Template Builder

1. **Login** to the system as an **Author** or **Admin**
2. Click on **"Templates"** in the left sidebar navigation
3. Click the **"Create Template"** button (top right)

## Step 1: Fill in Metadata (Left Panel)

Fill in the metadata fields in the left sidebar:

- **Template Title**: `Standard Operating Procedure` (or your specific SOP name)
- **Template Code**: `SP-KQA-007-01` (follow your naming convention)
- **Category**: Select `SOP`
- **Revision**: `01` (starts at 01, increments with each version)
- **Effective Date**: Select the date (optional)
- **Next Review Date**: Select the review date (optional)
- **CC Number**: Enter CC number if applicable
- **Department**: Select `Quality Assurance` (or your department)
- **Confidentiality**: Select `Internal` (or appropriate level)

## Step 2: Add Title Page Block

1. Click **"Title Page"** button in the "Add Block" section
2. This creates a pre-built title page block with:
   - Company header (Emcure)
   - SOP Title table
   - Metadata table with all template information

The title page block automatically includes tokens like:
- `{{TEMPLATE_TITLE}}`
- `{{TEMPLATE_CODE}}`
- `{{EFFECTIVE_DATE}}`
- `{{REVISION}}`
- `{{DEPARTMENT}}`
- `{{CC_NUMBER}}`

## Step 3: Add Document Signatory Page

1. Click **"Signatory Table"** button
2. This creates a signatory table block with columns:
   - Signature Type
   - Name
   - Designation
   - Department
   - Date & Time

The signatory table uses tokens:
- `{{SIGNATORY_PREPARED_NAME}}`
- `{{SIGNATORY_PREPARED_DESIGNATION}}`
- `{{SIGNATORY_PREPARED_DEPARTMENT}}`
- `{{SIGNATORY_PREPARED_DATE}}`
- `{{SIGNATORY_CHECKED_NAME}}`
- `{{SIGNATORY_CHECKED_DESIGNATION}}`
- `{{SIGNATORY_CHECKED_DEPARTMENT}}`
- `{{SIGNATORY_CHECKED_DATE}}`
- `{{SIGNATORY_APPROVED_NAME}}`
- `{{SIGNATORY_APPROVED_DESIGNATION}}`
- `{{SIGNATORY_APPROVED_DEPARTMENT}}`
- `{{SIGNATORY_APPROVED_DATE}}`

## Step 4: Add Content Sections

For each section, add a **"Heading"** block followed by a **"Paragraph"** block:

### 4.1 Purpose Section
1. Click **"Heading"**
   - In the heading text field, enter: `1.0 PURPOSE:`
2. Click **"Paragraph"** below it
   - In the editor, enter: `{{OBJECTIVE}}` or add your purpose text
   - Use the **"Insert Token"** button to add `{{OBJECTIVE}}` if needed

### 4.2 Scope Section
1. Click **"Heading"**
   - Heading text: `2.0 SCOPE:`
2. Click **"Paragraph"**
   - Enter: `{{SCOPE}}` or your scope content

### 4.3 Responsibility Section
1. Click **"Heading"**
   - Heading text: `3.0 RESPONSIBILITY:`
2. Click **"Paragraph"**
   - Enter: `{{RESPONSIBILITY}}` or your responsibility content

### 4.4 Accountability Section
1. Click **"Heading"**
   - Heading text: `4.0 ACCOUNTABILITY:`
2. Click **"Paragraph"**
   - Enter: `{{ACCOUNTABILITY}}` or your accountability content

### 4.5 Procedure Section
1. Click **"Heading"**
   - Heading text: `5.0 PROCEDURE:`
2. Click **"Paragraph"** (or use numbered list)
   - Enter: `{{PROCEDURE}}` or your procedure steps
   - You can use numbered lists in the editor for step-by-step procedures

### 4.6 List of Annexures Section
1. Click **"Heading"**
   - Heading text: `6.0 LIST OF ANNEXURES:`
2. Click **"Annexure Table"** button
   - This creates a table with columns: Annexure No. and Title
   - The table uses `{{ANNEXURES_TABLE}}` token

### 4.7 Format Section (if needed)
1. Click **"Heading"**
   - Heading text: `7.0 FORMAT:`
2. Click **"Table"** button
   - Create a table with Format No. and Title columns
   - Or use a paragraph with content

### 4.8 Reference Documents Section
1. Click **"Heading"**
   - Heading text: `8.0 REFERENCE DOCUMENTS:`
2. Click **"Table"** button
   - Create a table with Document No. and Title of the Document columns
   - Use `{{REFERENCE_TABLE}}` token if needed

### 4.9 Distribution List Section
1. Click **"Heading"**
   - Heading text: `9.0 DISTRIBUTION LIST:`
2. Click **"Table"** button
   - Create a table with Sr. No. and Name of the Department columns
   - Use `{{DISTRIBUTION_TABLE}}` token if needed

### 4.10 Change History Section
1. Click **"Heading"**
   - Heading text: `10.0 CHANGE HISTORY:`
2. Click **"Table"** button
   - Create a table with columns:
     - Rev. No.
     - Reason for revision and Change Control No.
     - Effective Date
   - Use `{{CHANGE_HISTORY_TABLE}}` token if needed

### 4.11 End of Document
1. Click **"Paragraph"**
   - Center align the text
   - Enter: `END OF DOCUMENT`

## Step 5: Inserting Tokens

For each content block where you want to use placeholders:

1. Click on the block's editor area
2. Click the **"Insert Token"** button above the editor
3. Select a token from the dropdown (grouped by category):
   - **Metadata**: TEMPLATE_TITLE, TEMPLATE_CODE, etc.
   - **Content**: OBJECTIVE, SCOPE, PROCEDURE, etc.
   - **Signatories**: SIGNATORY_PREPARED_NAME, etc.
   - **Dates**: EFFECTIVE_DATE, NEXT_REVIEW_DATE, etc.
   - **Tables**: ANNEXURES_TABLE, REFERENCE_TABLE, etc.
   - **System**: PAGE_NUMBER, CURRENT_DATE, etc.

The token will appear as `{{TOKEN_NAME}}` in the editor.

## Step 6: Preview Your Template

1. Click the **"Preview"** button (top right)
2. Review the rendered HTML preview
3. Tokens will be replaced with metadata values or show as placeholders
4. Close the preview when done

## Step 7: Save Your Template

1. Click **"Save Draft"** button
2. Your template is saved and ready for:
   - Further editing
   - Submission for review
   - Use in document creation

## Step 8: Submit for Review (Optional)

After saving:

1. Navigate to **Templates** → Click on your template
2. View template versions
3. Click **"Submit for Review"** on the draft version
4. Reviewers will be notified

## Complete Block Structure Example

Here's the recommended order of blocks for an SOP template:

1. **Title Page** (pre-built)
2. **Signatory Table** (pre-built)
3. **Heading**: `1.0 PURPOSE:`
4. **Paragraph**: Content with `{{OBJECTIVE}}` token
5. **Heading**: `2.0 SCOPE:`
6. **Paragraph**: Content with `{{SCOPE}}` token
7. **Heading**: `3.0 RESPONSIBILITY:`
8. **Paragraph**: Content with `{{RESPONSIBILITY}}` token
9. **Heading**: `4.0 ACCOUNTABILITY:`
10. **Paragraph**: Content with `{{ACCOUNTABILITY}}` token
11. **Heading**: `5.0 PROCEDURE:`
12. **Paragraph**: Content with `{{PROCEDURE}}` token (can use numbered lists)
13. **Heading**: `6.0 LIST OF ANNEXURES:`
14. **Annexure Table** (pre-built)
15. **Heading**: `7.0 FORMAT:` (optional)
16. **Table**: Format table
17. **Heading**: `8.0 REFERENCE DOCUMENTS:`
18. **Table**: Reference documents table
19. **Heading**: `9.0 DISTRIBUTION LIST:`
20. **Table**: Distribution list table
21. **Heading**: `10.0 CHANGE HISTORY:`
22. **Table**: Change history table
23. **Paragraph**: `END OF DOCUMENT` (centered)

## Tips

1. **Use Tokens**: Insert tokens for dynamic content that will change per document
2. **Consistent Formatting**: Use heading blocks for section titles to maintain consistency
3. **Tables**: Use the pre-built table blocks (Signatory, Annexure) for standard tables
4. **Preview Often**: Use preview to see how the final document will look
5. **Save Frequently**: Save your work as you build to avoid losing progress

## Using Your Template

Once published:

1. Go to **Documents** → **Create Document**
2. Select your template from the **"Use Template"** dropdown
3. The template content will preload into the editor
4. Fill in the token values as you create the document
5. Edit and finalize the document

## Need Help?

- Check the **Token Library** panel (right sidebar) for available tokens
- Use **Preview** to see how tokens will be replaced
- Review the template structure in the block list








