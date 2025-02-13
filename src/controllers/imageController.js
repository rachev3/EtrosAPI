import bucket from "../config/firebase.js";

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = `articles/${Date.now()}_${req.file.originalname}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    // Generate a public URL
    const [url] = await fileUpload.getSignedUrl({
      action: "read",
      expires: "03-01-2030", // Expiry date for URL access
    });

    res.status(201).json({ imageUrl: url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image", error });
  }
};

// ✅ Delete Image from Firebase
export const deletePhoto = async (req, res) => {
  try {
    const { fileName } = req.body; // Get file name from request

    if (!fileName) {
      return res.status(400).json({ message: "File name is required" });
    }

    const file = bucket.file(fileName);
    await file.delete();

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Error deleting image", error });
  }
};
