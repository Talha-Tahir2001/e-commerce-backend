import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import userModel, { type IUser } from "../models/userModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import sendToken from "../utils/jwtToken.js";
import ErrorHandler from "../utils/errorHandler.js";
// import cloudinary from "cloudinary";
// import sendEmail from "../utils/sendEmail";



// Extend Request to include user (from auth middleware)
export interface AuthRequest extends Request {
  user?: IUser & { id?: string; _id?: any };
  body: any;
  params: any;
}

// Register a User
export const registerUser = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    //   folder: "avatars",
    //   width: 150,
    //   crop: "scale",
    // });

    const { name, email, password } = req.body;

    const user = await userModel.create({
      name,
      email,
      password,
    //   avatar: {
    //     public_id: myCloud.public_id,
    //     url: myCloud.secure_url,
    //   },
    });

    sendToken(user, 201, res);
  }
);

// Login User
export const loginUser = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
  }
);

// Logout User
export const logout = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  }
);

// Forgot Password
export const forgotPassword = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then ignore it.`;

    try {
    //   await sendEmail({
    //     email: user.email,
    //     subject: "Ecommerce Password Recovery",
    //     message,
    //   });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error: any) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Reset Password
export const resetPassword = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Reset Password Token is invalid or has been expired",
          400
        )
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  }
);

// Get User Details
export const getUserDetails = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const user = await userModel.findById(req.user?.id);

    res.status(200).json({
      success: true,
      user,
    });
  }
);

// Update Password
export const updatePassword = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await userModel.findById(req.user?.id).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
  }
);

// Update Profile
export const updateProfile = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const newUserData: Partial<IUser> = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.body.avatar !== "") {
      const user = await userModel.findById(req.user?.id);

      if (user?.avatar?.public_id) {
        // await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }

    //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    //     folder: "avatars",
    //     width: 150,
    //     crop: "scale",
    //   });

    //   newUserData.avatar = {
    //     public_id: myCloud.public_id,
    //     url: myCloud.secure_url,
    //   };
    }

    await userModel.findByIdAndUpdate(req.user?.id, newUserData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
    });
  }
);

// Get All Users (Admin)
export const getAllUser = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const users = await userModel.find();

    res.status(200).json({
      success: true,
      users,
    });
  }
);

// Get Single User (Admin)
export const getSingleUser = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
);

// Update User Role (Admin)
export const updateUserRole = catchAsyncErrors(
  async (req: AuthRequest, res: Response) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    await userModel.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
    });
  }
);

// Delete User (Admin)
export const deleteUser = catchAsyncErrors(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
      );
    }

    if (user.avatar?.public_id) {
    //   await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  }
);