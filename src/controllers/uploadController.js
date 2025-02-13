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
