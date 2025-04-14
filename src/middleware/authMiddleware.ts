import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { AppError } from "./errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { JwtPayload } from "../types/index.js";
import { AuthRequest } from "../types/express/index.js";

dotenv.config();

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        throw new AppError(
          "Not authorized, invalid token format",
          401,
          "INVALID_TOKEN_FORMAT"
        );
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as JwtPayload;

        const user = await User.findById(decoded.id);

        if (!user) {
          throw new AppError(
            "User belonging to this token no longer exists",
            401,
            "USER_NOT_FOUND"
          );
        }

        (req as AuthRequest).user = user;
        next();
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "JsonWebTokenError") {
            throw new AppError(
              "Not authorized, invalid token",
              401,
              "INVALID_TOKEN"
            );
          } else if (error.name === "TokenExpiredError") {
            throw new AppError(
              "Not authorized, token expired",
              401,
              "TOKEN_EXPIRED"
            );
          } else {
            throw error;
          }
        } else {
          throw new AppError(
            "Unknown authentication error",
            401,
            "AUTHENTICATION_ERROR"
          );
        }
      }
    } else {
      throw new AppError("Not authorized, no token provided", 401, "NO_TOKEN");
    }
  }
);

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    throw new AppError(
      "User not authenticated",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  if (authReq.user.role !== "admin") {
    throw new AppError(
      "Access denied, admin privileges required",
      403,
      "ADMIN_REQUIRED"
    );
  }

  next();
};
