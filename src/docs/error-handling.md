# Error Handling Guide for Etros API

This document explains the error handling system used in the Etros API.

## Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "status": 400,
  "message": "Error message explaining what went wrong",
  "errorCode": "ERROR_CODE",
  "details": {
    // Additional error details (optional)
    // May contain field-specific errors or other context
  }
}
```

- **success**: Always `false` for error responses
- **status**: HTTP status code
- **message**: Human-readable error description
- **errorCode**: Machine-readable error code for programmatic handling
- **details**: Optional object with additional error context

## Common Error Codes

| Error Code                | HTTP Status | Description                                        |
| ------------------------- | ----------- | -------------------------------------------------- |
| `VALIDATION_ERROR`        | 400         | Request data failed validation                     |
| `MISSING_REQUIRED_FIELDS` | 400         | Required fields are missing                        |
| `INVALID_TOKEN`           | 401         | JWT token is invalid                               |
| `TOKEN_EXPIRED`           | 401         | JWT token has expired                              |
| `NO_TOKEN`                | 401         | No authentication token provided                   |
| `AUTHENTICATION_REQUIRED` | 401         | User must be authenticated                         |
| `ADMIN_REQUIRED`          | 403         | Admin privileges required                          |
| `RESOURCE_NOT_FOUND`      | 404         | The requested resource was not found               |
| `DUPLICATE_VALUE`         | 409         | Duplicate field value (e.g., email already exists) |

## Error Handling for Frontend Developers

### Basic Error Handling

```javascript
async function fetchData() {
  try {
    const response = await fetch("/api/resource");
    const data = await response.json();

    if (!data.success) {
      // Handle error based on error code
      handleApiError(data);
      return;
    }

    // Process successful data
    return data.data;
  } catch (error) {
    // Handle network errors
    console.error("Network error:", error);
  }
}

function handleApiError(error) {
  switch (error.errorCode) {
    case "VALIDATION_ERROR":
      // Show validation errors to user
      showValidationErrors(error.details);
      break;
    case "TOKEN_EXPIRED":
      // Redirect to login
      redirectToLogin();
      break;
    default:
      // Show generic error message
      showErrorMessage(error.message);
  }
}
```

### Form Validation Errors

When submitting forms, handle validation errors by mapping them to form fields:

```javascript
async function submitForm(formData) {
  try {
    const response = await fetch("/api/resource", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!result.success) {
      if (result.errorCode === "VALIDATION_ERROR") {
        // Map errors to form fields
        Object.entries(result.details).forEach(([field, message]) => {
          setFieldError(field, message);
        });
        return;
      }

      // Handle other errors
      showErrorMessage(result.message);
      return;
    }

    // Handle success
    showSuccessMessage("Form submitted successfully");
  } catch (error) {
    showErrorMessage("Network error. Please try again.");
  }
}
```

## Error Handling on the Backend

For API developers, use the following patterns for error handling:

### Using AsyncHandler

Wrap controller functions with the `asyncHandler` to avoid repetitive try/catch blocks:

```javascript
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

export const getResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    throw new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    data: resource,
  });
});
```

### Using Validation Utilities

Use the validation utilities for consistent request validation:

```javascript
import { validateRequiredFields } from "../utils/validator.js";

export const createResource = asyncHandler(async (req, res) => {
  // Validate required fields
  validateRequiredFields(req.body, ["name", "description"]);

  // Create resource if validation passes
  const resource = await Resource.create(req.body);

  res.status(201).json({
    success: true,
    data: resource,
  });
});
```

## Extending the Error Handling System

To add new error types, update the `errorHandler.js` middleware to handle the new error types and provide appropriate error codes and messages.
