import User from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncHandler from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import {
  AuthRequest,
  TypedRequest,
  TypedResponse,
} from "../types/express/index";
import { ApiResponse } from "../types/index";
import { IUser, UserRole, UserDocument } from "../types/models/User";
import { ENV } from "../config/env";

dotenv.config();

interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginUserRequest {
  email: string;
  password: string;
}

interface UserResponseData {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  token: string;
}

interface UserProfileResponse {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const formatUserResponse = (user: UserDocument): UserResponseData => {
  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    token: generateToken(user._id.toString()),
  };
};

export const registerUser = asyncHandler(
  async (
    req: TypedRequest<RegisterUserRequest>,
    res: TypedResponse<ApiResponse<UserResponseData>>
  ) => {
    const { username, email, password } = req.body;

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

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError(
        "User already exists with this email",
        409,
        "USER_EXISTS"
      );
    }

    const userData: IUser = {
      username,
      email,
      password,
      role: "user",
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: formatUserResponse(user),
    });
  }
);

export const loginUser = asyncHandler(
  async (
    req: TypedRequest<LoginUserRequest>,
    res: TypedResponse<ApiResponse<UserResponseData>>
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "Please provide email and password",
        400,
        "MISSING_CREDENTIALS"
      );
    }

    const user = await (User.findOne({ email }) as any).select("+password");

    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

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
      data: formatUserResponse(user),
    });
  }
);

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

    const user = await User.findById(req.user._id.toString());

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
