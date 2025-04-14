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
import { validateRequiredFields, validateUnique } from "../utils/validator";

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
    validateRequiredFields(req.body, ["username", "email", "password"]);
    await validateUnique(User, "email", req.body.email, "email");
    const userData: IUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
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
    validateRequiredFields(req.body, ["email", "password"]);
    const user = await (User.findOne({ email: req.body.email }) as any).select(
      "+password"
    );
    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }
    const isMatch = await user.matchPassword(req.body.password);
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
