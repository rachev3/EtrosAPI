import multer from "multer";

// Store files in memory before uploading to cloud storage
const storage = multer.memoryStorage();

// Configure multer with memory storage
const upload = multer({ storage });

export default upload;
