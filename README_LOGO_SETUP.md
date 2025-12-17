# Logo Setup Instructions

## Adding the zerokost Logo Image

To use the zerokost Healthcare logo in document templates, please follow these steps:

### 1. Frontend Setup
Place the logo image file (`zerokost-logo.png`) in the `frontend/public/` directory.

**Path:** `frontend/public/zerokost-logo.png`

The image will be accessible at `/zerokost-logo.png` in the frontend.

### 2. Backend Setup
Place the same logo image file in one of these locations (in order of preference):

1. **Primary location:** `backend/app/static/zerokost-logo.png`
2. **Fallback location:** `backend/storage/static/zerokost-logo.png`

The backend will use this image when generating DOCX documents.

### 3. Image Requirements
- **Format:** PNG (recommended) or JPG
- **Recommended size:** 
  - Width: 200-400px
  - Height: 60-120px
  - Aspect ratio: Maintain original logo proportions
- **File name:** `zerokost-logo.png` (must match exactly)

### 4. Testing
After placing the image:
1. Restart the frontend development server
2. Restart the backend server
3. Create a new template and check the title page preview
4. Generate a DOCX document to verify the logo appears correctly

### Notes
- The logo will automatically resize to fit the table cell (max-height: 80px in HTML preview)
- In DOCX generation, the logo width is set to 3.5cm to fit the 20% width cell
- If the image is not found, the system will fallback to text: "zerokost Healthcare Pvt. Ltd."







