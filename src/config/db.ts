import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Connects to MongoDB using the connection string from environment variables
 * @returns {Promise<void>}
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected!");
  } catch (err) {
    console.error("Database connection failed:", (err as Error).message);
    process.exit(1);
  }
};

export default connectDB;
