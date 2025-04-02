# Image Handling Documentation

## Overview

The image handling system provides secure cloud-based image storage and management using Cloudinary. This system is designed for admin users to upload and manage images used throughout the application, particularly for articles and other content.

## Configuration

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cloudinary Setup

The Cloudinary configuration is handled in `src/config/cloudinary.js`:

```javascript
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

## API Endpoints

### Upload Image

- **Endpoint**: `POST /api/images/upload`
- **Authentication**: Required (Admin only)
- **Request Body**: `multipart/form-data`
  ```
  image: File (image file to upload)
  ```
- **Response (201)**:
  ```json
  {
    "message": "Image uploaded successfully",
    "imageUrl": "https://res.cloudinary.com/[cloud_name]/image/upload/...",
    "fileName": "articles/[public_id]"
  }
  ```
- **Error Responses**:
  - 400: "No file uploaded"
  - 500: Upload failed with error details

### Delete Image

- **Endpoint**: `DELETE /api/images/delete`
- **Authentication**: Required (Admin only)
- **Request Body**:
  ```json
  {
    "fileName": "articles/[public_id]"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "Image deleted successfully"
  }
  ```
- **Error Responses**:
  - 400: "File name is required"
  - 500: Deletion failed with error details

## Implementation Details

### Middleware

1. **Authentication Middleware** (`authMiddleware.js`)

   - Verifies JWT token
   - Checks admin privileges

2. **Upload Middleware** (`uploadMiddleware.js`)

   ```javascript
   import multer from "multer";

   const storage = multer.memoryStorage();
   const upload = multer({ storage });
   ```

### Image Controller

The image controller (`imageController.js`) handles two main operations:

1. **Upload Photo**:

   - Validates file presence
   - Streams file to Cloudinary
   - Returns secure URL and public ID
   - Handles errors with appropriate logging

2. **Delete Photo**:
   - Validates fileName parameter
   - Removes image from Cloudinary
   - Returns success confirmation
   - Handles errors with appropriate logging

## Security Considerations

### Access Control

- All image operations require authentication
- Only admin users can upload/delete images
- JWT token validation for each request

### File Handling

- Files are stored in memory temporarily
- Direct streaming to Cloudinary
- No local file system storage
- Secure URLs provided by Cloudinary

### Error Handling

- Comprehensive error logging
- Appropriate HTTP status codes
- Detailed error messages for debugging
- Client-safe error responses

## Best Practices

1. **Image Upload**:

   - Use appropriate content types
   - Implement file size limits
   - Validate file types
   - Handle upload timeouts

2. **Image Storage**:

   - Use dedicated folders in Cloudinary
   - Maintain unique file names
   - Store image references securely

3. **Error Management**:
   - Log all operations
   - Provide clear error messages
   - Handle network issues gracefully

## Integration Example

### Frontend Upload

```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/images/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.imageUrl;
};
```

### Frontend Delete

```javascript
const deleteImage = async (fileName) => {
  const response = await fetch("/api/images/delete", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName }),
  });

  return response.json();
};
```

## Error Codes

| Code              | Description                  | HTTP Status |
| ----------------- | ---------------------------- | ----------- |
| FILE_NOT_FOUND    | No file in request           | 400         |
| UPLOAD_FAILED     | Cloudinary upload error      | 500         |
| INVALID_FILE_NAME | Missing or invalid file name | 400         |
| DELETE_FAILED     | Cloudinary delete error      | 500         |
| UNAUTHORIZED      | Not authenticated            | 401         |
| FORBIDDEN         | Not admin                    | 403         |

## Related Documentation

- [Error Handling](./error-handling.md)
- [Error Codes](./error-codes.md)
