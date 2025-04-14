import mongoose from "mongoose";
import dotenv from "dotenv";
import { ENV } from "./env";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("MongoDB Connected!");
  } catch (err) {
    console.error("Database connection failed:", (err as Error).message);
    process.exit(1);
  }
};

export default connectDB;
