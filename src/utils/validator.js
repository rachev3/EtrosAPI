import { AppError } from "../middleware/errorHandler.js";

/**
 * Validates required fields in a request body
 *
 * @param {Object} body - Request body object
 * @param {Array} requiredFields - Array of required field names
 * @throws {AppError} - Throws error if any required field is missing
 */
export const validateRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "MISSING_REQUIRED_FIELDS",
      { missingFields }
    );
  }
};

/**
 * Validates that a field matches an expected format (e.g., email, password)
 *
 * @param {string} field - The field to validate
 * @param {RegExp} pattern - Regex pattern to match against
 * @param {string} fieldName - Name of the field for error messages
 * @param {string} errorMessage - Custom error message
 * @throws {AppError} - Throws error if field doesn't match pattern
 */
export const validateFormat = (field, pattern, fieldName, errorMessage) => {
  if (!pattern.test(field)) {
    throw new AppError(
      errorMessage || `Invalid ${fieldName} format`,
      400,
      `INVALID_${fieldName.toUpperCase()}_FORMAT`,
      { field: fieldName }
    );
  }
};

/**
 * Validates that a field is within a certain length range
 *
 * @param {string} field - The field to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Name of the field for error messages
 * @throws {AppError} - Throws error if field length is outside the range
 */
export const validateLength = (field, min, max, fieldName) => {
  if (field.length < min || field.length > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max} characters`,
      400,
      `INVALID_${fieldName.toUpperCase()}_LENGTH`,
      { field: fieldName, min, max, current: field.length }
    );
  }
};

/**
 * Validates that a field is a valid MongoDB ObjectId
 *
 * @param {string} id - The ID to validate
 * @param {string} fieldName - Name of the field for error messages
 * @throws {AppError} - Throws error if ID is not valid
 */
export const validateObjectId = (id, fieldName = "ID") => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(id)) {
    throw new AppError(
      `Invalid ${fieldName} format`,
      400,
      `INVALID_${fieldName.toUpperCase()}_FORMAT`,
      { field: fieldName, value: id }
    );
  }
};
