# Etros API Error Codes Reference

This document provides a comprehensive list of all error codes used in the Etros API.

## Authentication Errors

| Error Code                | Status | Description                         | Solution                                           |
| ------------------------- | ------ | ----------------------------------- | -------------------------------------------------- |
| `INVALID_CREDENTIALS`     | 401    | Invalid email or password           | Verify your credentials and try again              |
| `NO_TOKEN`                | 401    | No authentication token provided    | Include a Bearer token in the Authorization header |
| `INVALID_TOKEN`           | 401    | The provided token is invalid       | Obtain a new token by logging in again             |
| `TOKEN_EXPIRED`           | 401    | The provided token has expired      | Obtain a new token by logging in again             |
| `AUTHENTICATION_REQUIRED` | 401    | This route requires authentication  | Log in and include your token in the request       |
| `ADMIN_REQUIRED`          | 403    | Admin privileges required           | Only admin users can access this resource          |
| `USER_EXISTS`             | 409    | User already exists with this email | Use a different email address or try to log in     |
| `USER_NOT_FOUND`          | 404    | User not found                      | Verify the user ID or credentials                  |

## Validation Errors

| Error Code                | Status | Description                     | Solution                                           |
| ------------------------- | ------ | ------------------------------- | -------------------------------------------------- |
| `VALIDATION_ERROR`        | 400    | Request data failed validation  | Check the error details for field-specific errors  |
| `MISSING_REQUIRED_FIELDS` | 400    | Required fields are missing     | Provide all required fields in your request        |
| `MISSING_FIELDS`          | 400    | Some fields are missing         | Check error details for the list of missing fields |
| `MISSING_CREDENTIALS`     | 400    | Email and password are required | Provide both email and password                    |
| `INVALID_EMAIL_FORMAT`    | 400    | Invalid email format            | Provide a valid email address                      |
| `INVALID_PASSWORD_LENGTH` | 400    | Password length is invalid      | Password must meet the length requirements         |

## Resource Errors

| Error Code           | Status | Description                          | Solution                    |
| -------------------- | ------ | ------------------------------------ | --------------------------- |
| `RESOURCE_NOT_FOUND` | 404    | The requested resource was not found | Verify the resource ID      |
| `PLAYER_NOT_FOUND`   | 404    | Player not found                     | Verify the player ID        |
| `PLAYER_EXISTS`      | 409    | Player with this name already exists | Use a different player name |
| `MATCH_NOT_FOUND`    | 404    | Match not found                      | Verify the match ID         |
| `ARTICLE_NOT_FOUND`  | 404    | Article not found                    | Verify the article ID       |

## Database Errors

| Error Code        | Status | Description               | Solution                                |
| ----------------- | ------ | ------------------------- | --------------------------------------- |
| `DUPLICATE_VALUE` | 409    | Duplicate field value     | The value for this field must be unique |
| `DATABASE_ERROR`  | 500    | Database operation failed | Try again later or contact support      |

## File Upload Errors

| Error Code          | Status | Description                | Solution                                  |
| ------------------- | ------ | -------------------------- | ----------------------------------------- |
| `FILE_TOO_LARGE`    | 413    | Uploaded file is too large | Reduce file size and try again            |
| `UNEXPECTED_FILE`   | 400    | Unexpected file in upload  | Check the field names in your upload form |
| `INVALID_FILE_TYPE` | 400    | Invalid file type          | Upload a file with an allowed extension   |

## Server Errors

| Error Code          | Status | Description                      | Solution                               |
| ------------------- | ------ | -------------------------------- | -------------------------------------- |
| `UNKNOWN_ERROR`     | 500    | An unknown server error occurred | Try again later or contact support     |
| `APPLICATION_ERROR` | 500    | An application error occurred    | Check error details or contact support |

## Using Error Codes

Frontend applications should handle these error codes appropriately:

```javascript
// Example of handling specific error codes
function handleApiError(error) {
  switch (error.errorCode) {
    case "TOKEN_EXPIRED":
    case "INVALID_TOKEN":
      // Redirect to login page
      redirectToLogin();
      break;

    case "VALIDATION_ERROR":
    case "MISSING_REQUIRED_FIELDS":
      // Show validation errors on the form
      displayValidationErrors(error.details);
      break;

    case "RESOURCE_NOT_FOUND":
    case "PLAYER_NOT_FOUND":
    case "MATCH_NOT_FOUND":
      // Show not found message
      showNotFoundMessage(error.message);
      break;

    case "ADMIN_REQUIRED":
      // Show permission denied message
      showPermissionDeniedMessage();
      break;

    default:
      // Show generic error message
      showErrorMessage(error.message);
  }
}
```
