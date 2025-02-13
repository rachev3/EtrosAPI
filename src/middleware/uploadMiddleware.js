import multer from "multer";

const storage = multer.memoryStorage(); // Stores files in memory before uploading to Firebase
const upload = multer({ storage });

export default upload;
