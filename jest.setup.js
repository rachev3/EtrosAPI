import mongoose from "mongoose";
import { jest } from "@jest/globals";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to test database before tests
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    console.log("Connected to test database");
  } catch (error) {
    console.error("Error connecting to test database:", error);
  }
});

// Disconnect from test database after tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log("Disconnected from test database");
  } catch (error) {
    console.error("Error disconnecting from test database:", error);
  }
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(10000);
