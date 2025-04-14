import cloudinary from "../config/cloudinary";
import { AppError } from "../middleware/errorHandler";
import { Request } from "express";

export async function uploadPhoto(
  file: Express.Multer.File
): Promise<{ secure_url: string; public_id: string }> {
  if (!file) {
    throw new AppError("No file uploaded", 400, "NO_FILE_UPLOADED");
  }
  return await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "articles" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(
              new AppError("Upload failed", 500, "UPLOAD_FAILED", { error })
            );
            return;
          }
          resolve(result as any);
        }
      );
      uploadStream.end(file.buffer);
    }
  );
}

export async function deletePhoto(fileName: string): Promise<void> {
  if (!fileName) {
    throw new AppError("File name is required", 400, "FILE_NAME_REQUIRED");
  }
  await cloudinary.uploader.destroy(fileName);
}
