import app from "./app.js";
import connectDB from "./config/db.js";
import { Server } from "http";

const PORT: number = parseInt(process.env.PORT || "5000", 10);

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start the Server only after the DB is connected
    const server: Server = app.listen(PORT, () =>
      console.log(`Server running on port http://localhost:${PORT}`)
    );
  })
  .catch((err: Error) => {
    console.error("Failed to connect to MongoDB:", err);
  });
