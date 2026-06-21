import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import userModel from "../models/userModel.js";

interface JwtPayload {
  id: string;
}

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: any; // you can replace with IUser later for stricter typing
}

export const isAuthenticatedUser = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { token } = req.cookies;

    if (!token) {
      return next(
        new ErrorHandler("Please Login to access this resource", 401),
      );
    }

    const decodedData = jwt.verify(
      token,
      process.env["JWT_SECRET"] as string,
    ) as JwtPayload;

    req.user = await userModel.findById(decodedData.id);

    next();
  },
);

export const authorizeRoles =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorHandler("User not found", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403,
        ),
      );
    }

    next();
  };
