import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { Request, Response } from "express";
import {
  AuthRequest,
  TypedRequest,
  TypedResponse,
} from "../types/express/index.js";
import { ApiResponse, JwtPayload } from "../types/index.js";
import { IUser, UserDocument, UserRole } from "../types/models/User.js";

dotenv.config();

// Type for user registration request body
interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

// Type for user login request body
interface LoginUserRequest {
  email: string;
  password: string;
}

// Type for user response data
interface UserResponseData {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  token: string;
}

// Type for user profile response data without password
interface UserProfileResponse {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// **Generate JWT Token**
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d", // Token valid for 7 days
  });
};

// **User Registration**
export const registerUser = asyncHandler(
  async (
    req: TypedRequest<RegisterUserRequest>,
    res: TypedResponse<ApiResponse<UserResponseData>>
  ) => {
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

    // Create new user with all required fields from IUser
    const userData: IUser = {
      username,
      email,
      password,
      role: "user", // Default role
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  }
);

// **User Login**
export const loginUser = asyncHandler(
  async (
    req: TypedRequest<LoginUserRequest>,
    res: TypedResponse<ApiResponse<UserResponseData>>
  ) => {
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
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    res.json({
      success: true,
      data: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  }
);

// **Get User Profile (Protected Route)**
export const getUserProfile = asyncHandler(
  async (
    req: AuthRequest,
    res: TypedResponse<ApiResponse<UserProfileResponse>>
  ) => {
    if (!req.user) {
      throw new AppError(
        "User not authenticated",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    const userId = req.user._id.toString();
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const userResponse: UserProfileResponse = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      data: userResponse,
    });
  }
);
