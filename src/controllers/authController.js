import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

dotenv.config();

// **Generate JWT Token**
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valid for 7 days
  });
};

// **User Registration**
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if all required fields are provided
  if (!username || !email || !password) {
    throw new AppError(
      "Please provide all required fields",
      400,
      "MISSING_FIELDS",
      {
        missingFields: Object.entries({ username, email, password })
          .filter(([_, value]) => !value)
          .map(([key]) => key),
      }
    );
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError(
      "User already exists with this email",
      409,
      "USER_EXISTS"
    );
  }

  // Create new user
  const user = await User.create({ username, email, password });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// **User Login**
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    throw new AppError(
      "Please provide email and password",
      400,
      "MISSING_CREDENTIALS"
    );
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// **Get User Profile (Protected Route)**
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password"); // Exclude password

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  res.json({
    success: true,
    data: user,
  });
});
