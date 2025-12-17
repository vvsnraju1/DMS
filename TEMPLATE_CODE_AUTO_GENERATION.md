# Template Code Auto-Generation

## Overview
Template codes are now automatically generated based on category, department, and sequential numbering. You can still manually enter a code if needed.

## Code Format

### Forms
**Format:** `SP-DEPT-NUM-F##-##`

**Example:** `SP-QA-051-F01-01`

- `SP`: Standard Procedure prefix
- `QA`: Department code (Quality Assurance)
- `051`: Sequential number (auto-incremented per form in department)
- `F01`: Form number (defaults to F01, can be customized)
- `01`: Revision number

### SOP, STP, Report, Annexure
**Format:** `SP-DEPT-NUM-##`

**Example:** `SP-PKG-002-01`

- `SP`: Standard Procedure prefix
- `PKG`: Department code (Packaging)
- `002`: Sequential number (auto-incremented per template in department/category)
- `01`: Revision number

## Department Codes

| Department | Code |
|------------|------|
| Quality Assurance | QA |
| Quality Control | QC |
| Production | PROD |
| Packaging | PKG |
| R&D | R&D |
| Regulatory / Regulatory Affairs | REG |
| Manufacturing | MFG |
| Engineering | ENG |
| Safety | SAF |
| Kurkumbh | KQA |

## How It Works

1. **When Creating a Template:**
   - Fill in Category, Department, and Revision
   - Leave Template Code field **empty** (or enter manually if you want a specific code)
   - The system will auto-generate a unique code when you save

2. **Code Preview:**
   - As you select Category, Department, and Revision, a preview appears showing the format
   - Example: `SP-QA-XXX-F01-01` (XXX will be replaced with sequential number)

3. **Sequential Numbering:**
   - The system finds the highest existing sequential number for that department + category
   - Increments by 1 for the new template
   - Ensures uniqueness

4. **Manual Override:**
   - You can still enter a custom template code
   - The system will validate it's unique
   - Click "Clear to use auto-generated" to switch back to auto-generation

## Examples

### Creating a Form Template
- Category: **Form**
- Department: **Quality Assurance**
- Revision: **01**
- **Auto-generated code:** `SP-QA-001-F01-01` (if first form)
- Next form: `SP-QA-002-F01-01`

### Creating an SOP Template
- Category: **SOP**
- Department: **Packaging**
- Revision: **01**
- **Auto-generated code:** `SP-PKG-001-01` (if first SOP)
- Next SOP: `SP-PKG-002-01`

### Creating Another Form
- Category: **Form**
- Department: **Quality Assurance**
- Revision: **01**
- **Auto-generated code:** `SP-QA-003-F01-01` (if 2 forms already exist)

## Benefits

1. **Consistency:** All template codes follow the same format
2. **Uniqueness:** Automatically ensures no duplicate codes
3. **Organization:** Easy to identify department and category from code
4. **Flexibility:** Can still manually enter codes when needed

## Notes

- Sequential numbers are **per department + category combination**
- Forms in QA start at 001, Forms in PKG also start at 001 (separate sequences)
- Revision number comes from the Revision field in metadata
- Form number (F01) defaults to F01; can be customized in future versions








