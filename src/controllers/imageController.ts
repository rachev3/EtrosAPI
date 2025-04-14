import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import asyncHandler from "../utils/asyncHandler";
import {
  validateFileType,
  validateFileSize,
  validateRequiredFields,
} from "../utils/validator";
import {
  uploadPhoto as imageServiceUpload,
  deletePhoto as imageServiceDelete,
} from "../services/imageService";

interface DeletePhotoRequestBody {
  fileName: string;
}

interface FileRequest extends Request {
  file?: Express.Multer.File;
}

export const uploadPhoto = asyncHandler(
  async (req: FileRequest, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400, "NO_FILE_UPLOADED");
    }
    validateFileType(req.file, ["image/jpeg", "image/png", "image/webp"]);
    validateFileSize(req.file, 1 * 1024 * 1024); // 1MB
    const uploadResult = await imageServiceUpload(req.file!);
    res.status(201).json({
      success: true,
      data: {
        message: "Image uploaded successfully",
        imageUrl: uploadResult.secure_url,
        fileName: uploadResult.public_id,
      },
    });
  }
);

export const deletePhoto = asyncHandler(async (req: Request, res: Response) => {
  validateRequiredFields(req.body, ["fileName"]);
  const { fileName } = req.body as DeletePhotoRequestBody;

  if (!fileName) {
    throw new AppError("File name is required", 400, "FILE_NAME_REQUIRED");
  }

  await imageServiceDelete(fileName);

  res.status(200).json({
    success: true,
    data: {
      message: "Image deleted successfully",
    },
  });
});
