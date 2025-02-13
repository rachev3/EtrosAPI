import cloudinary from "../config/cloudinary.js";

// ✅ Upload Image to Cloudinary
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    cloudinary.uploader
      .upload_stream(
        { folder: "articles" }, // Save in Cloudinary "articles" folder
        (error, result) => {
          if (error)
            return res.status(500).json({ message: "Upload failed", error });

          res.status(201).json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
            fileName: result.public_id, // Save this to delete later
          });
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image", error });
  }
};

// ✅ Delete Image from Cloudinary
export const deletePhoto = async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ message: "File name is required" });
    }

    await cloudinary.uploader.destroy(fileName);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Error deleting image", error });
  }
};
