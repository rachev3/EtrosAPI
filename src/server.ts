import app from "./app";
import connectDB from "./config/db";
import { Server } from "http";
import { ENV } from "./config/env";

const PORT: number = ENV.PORT;

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
