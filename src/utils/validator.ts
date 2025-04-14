import { AppError } from "../middleware/errorHandler.js";

export const validateRequiredFields = (
  body: Record<string, any>,
  requiredFields: string[]
): void => {
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

export const validateFormat = (
  field: string,
  pattern: RegExp,
  fieldName: string,
  errorMessage?: string
): void => {
  if (!pattern.test(field)) {
    throw new AppError(
      errorMessage || `Invalid ${fieldName} format`,
      400,
      `INVALID_${fieldName.toUpperCase()}_FORMAT`,
      { field: fieldName }
    );
  }
};

export const validateLength = (
  field: string,
  min: number,
  max: number,
  fieldName: string
): void => {
  if (field.length < min || field.length > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max} characters`,
      400,
      `INVALID_${fieldName.toUpperCase()}_LENGTH`,
      { field: fieldName, min, max, current: field.length }
    );
  }
};

export const validateObjectId = (
  id: string,
  fieldName: string = "ID"
): void => {
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
