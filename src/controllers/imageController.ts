import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import asyncHandler from "../utils/asyncHandler";
import {
  validateFileType,
  validateFileSize,
  validateRequiredFields,
} from "../utils/validator";

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

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "articles" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(error);
            return;
          }
          resolve(result as any);
        }
      );

      uploadStream.end(req.file!.buffer);
    }).catch((error) => {
      throw new AppError("Upload failed", 500, "UPLOAD_FAILED", { error });
    });

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

  await cloudinary.uploader.destroy(fileName);

  res.status(200).json({
    success: true,
    data: {
      message: "Image deleted successfully",
    },
  });
});
