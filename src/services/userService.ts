import User from "../models/User";
import { IUser, UserDocument, UserRole } from "../types/models/User";
import { AppError } from "../middleware/errorHandler";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export async function registerUser(data: IUser): Promise<UserDocument> {
  const userExists = await User.findOne({ email: data.email });
  if (userExists) {
    throw new AppError(
      "User already exists with this email",
      409,
      "USER_EXISTS"
    );
  }
  const user = await User.create(data);
  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserDocument> {
  const user = await (User.findOne({ email }) as any).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
  return user;
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: "1d",
  });
}

export async function getUserProfile(userId: string): Promise<UserDocument> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
  return user;
}
