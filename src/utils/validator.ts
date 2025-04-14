import { AppError } from "../middleware/errorHandler";
import mongoose from "mongoose";

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

export const validateEnum = (
  field: string,
  allowedValues: string[],
  fieldName: string
): void => {
  if (!allowedValues.includes(field)) {
    throw new AppError(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`,
      400,
      `INVALID_${fieldName.toUpperCase()}_ENUM`,
      { field: fieldName, allowedValues }
    );
  }
};

export const validateUnique = async (
  model: mongoose.Model<any>,
  field: string,
  value: any,
  fieldName: string
): Promise<void> => {
  const exists = await model.exists({ [field]: value });
  if (exists) {
    throw new AppError(
      `${fieldName} must be unique. Value '${value}' already exists.`,
      409,
      `DUPLICATE_${fieldName.toUpperCase()}`,
      { field: fieldName, value }
    );
  }
};

export const validateNumberRange = (
  field: number,
  min: number,
  max: number,
  fieldName: string
): void => {
  if (typeof field !== "number" || field < min || field > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max}`,
      400,
      `INVALID_${fieldName.toUpperCase()}_RANGE`,
      { field: fieldName, min, max, current: field }
    );
  }
};

export const validateArray = (
  field: any[],
  minLength: number,
  maxLength: number,
  fieldName: string
): void => {
  if (
    !Array.isArray(field) ||
    field.length < minLength ||
    field.length > maxLength
  ) {
    throw new AppError(
      `${fieldName} must be an array with length between ${minLength} and ${maxLength}`,
      400,
      `INVALID_${fieldName.toUpperCase()}_ARRAY_LENGTH`,
      { field: fieldName, minLength, maxLength, current: field?.length }
    );
  }
};

export const validateDate = (field: string, fieldName: string): void => {
  const date = new Date(field);
  if (isNaN(date.getTime())) {
    throw new AppError(
      `${fieldName} must be a valid date string (ISO format)`,
      400,
      `INVALID_${fieldName.toUpperCase()}_DATE`,
      { field: fieldName, value: field }
    );
  }
};

export const validateFileType = (
  file: Express.Multer.File,
  allowedTypes: string[]
): void => {
  if (!file || !allowedTypes.includes(file.mimetype)) {
    throw new AppError(
      `File type must be one of: ${allowedTypes.join(", ")}`,
      400,
      "INVALID_FILE_TYPE",
      { allowedTypes, received: file?.mimetype }
    );
  }
};

export const validateFileSize = (
  file: Express.Multer.File,
  maxSize: number
): void => {
  if (!file || file.size > maxSize) {
    throw new AppError(
      `File size must not exceed ${maxSize} bytes`,
      400,
      "FILE_TOO_LARGE",
      { maxSize, received: file?.size }
    );
  }
};
