import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  sendResetPasswordOtpEmail,
  sendResetPwdSuccessfullyMail,
  sendVerificatinMail,
  sendWemcomeEmail,
} from "../mailing-service/emails";
import House from "../models/house.model";
import { User } from "../models/user.model";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";

// Extend Request with userId
interface AuthRequest extends Request {
  userId?: string;
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, username, password, address = "", phone = "" } = req.body;

    if (!email || !password || !username) {
      throw new Error("EMAIL, USERNAME AND PASSWORD ARE REQUIRED!");
    }

    const isExisted = await User.findOne({ email }).lean();
    if (isExisted && isExisted.isVerified)
      throw new Error("USER ALREADY EXISTS");
    const verificationToken = Math.floor(100000 + Math.random() * 900000); //6 digits code

    const verificationTokenExpiresAt = new Date(Date.now() + 3600 * 1000 * 24); // This sets the expiration time to 24 hour(in ms) from now
    let user;
    password = await bcrypt.hash(password, 10);
    if (isExisted && !isExisted.isVerified) {
      user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            username,
            password,
            verificationToken,
            verificationTokenExpiresAt,
            address,
            phone,
          },
        },
        { new: true }
      );
    } else {
      user = await User.create({
        username,
        email,
        password,
        verificationToken,
        verificationTokenExpiresAt,
        address,
        phone,
      });
    }
    await sendVerificatinMail(user.email, String(verificationToken));
    res.status(201).json({
      status: "success",
      message: "verification email sent successfully",
      data: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const verifyMail = async (
  req: Request,
  res: Response
): Promise<void> => {
  //1 2 3 6 8 7 form the frontend
  try {
    const { code } = req.body;
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      res.status(400).json({
        status: "fail",
        message: "invalid or expired verification code",
      });
      return;
    }
    await sendWemcomeEmail(user.email, user.username);
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    generateTokenAndSetCookie(res, user._id.toString());
    res.status(200).json({
      status: "success",
      message: "email verified successfully",
      data: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    res.clearCookie("auth-token");
    console.log("error in send verification mail");
    res.status(404).json({
      status: "failed",
      message: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("missing email or password field");
    }
    console.log("Login attempt for email:", email);
    const user = await User.findOne({ email });
    if (!user) throw new Error("user does not exit please signup");
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("invalid password");
    generateTokenAndSetCookie(res, user.id);
    user.lastLogin = new Date();
    await user.save();
    res.status(200).json({
      status: "success",
      message: "user logged in successfully",
      data: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("auth-token");
  res.status(200).json({
    status: "success",
    message: "user logged out successfully",
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("email is required!");
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "User not found",
      });
      return;
    }
    // Create a 6-digit numeric OTP as a string
    const otp = Math.floor(100000 + Math.random() * 900000); // e
    // Hash the OTP before storing (so DB doesn't contain raw codes)
    const hashedOtp = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");
    const resetPasswordTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = hashedOtp;
    user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;

    await user.save();
    await sendResetPasswordOtpEmail(String(otp), user.email, user.username); // function will include OTP in email

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({
      status: "failed",
      message: (error as Error).message || "Server error",
    });
  }
};

export const verifyResetOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        status: "fail",
        message: "Email and OTP are required",
      });
      return;
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      res.status(400).json({
        status: "fail",
        message: "Invalid or expired OTP",
      });
      return;
    }

    // Hash OTP received from user
    const hashedOtp = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    // Compare hashed OTP with DB
    if (
      user.resetPasswordToken !== hashedOtp ||
      !user.resetPasswordTokenExpiresAt ||
      user.resetPasswordTokenExpiresAt.getTime() < Date.now()
    ) {
      res.status(400).json({
        status: "fail",
        message: "Invalid or expired OTP",
      });
      return;
    }

    // OTP valid → issue a short-lived token (10 minutes)
    const tempResetToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.SECRET_KEY as string,
      { expiresIn: "10m" }
    );

    res.cookie("tempResetToken", tempResetToken, {
      httpOnly: true,
      secure: false, // MUST be false on localhost
      sameSite: "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("verifyResetOtp error:", error);
    res.status(500).json({
      status: "fail",
      message: (error as Error).message || "Server error",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tempResetToken = req.cookies.tempResetToken;
    const { newPassword, confirmPassword } = req.body;

    if (!tempResetToken) throw new Error("Missing reset token");

    if (!newPassword || !confirmPassword)
      throw new Error("Both passwords are required");
    if (newPassword !== confirmPassword)
      throw new Error("Passwords do not match");

    // Verify the temporary token
    const decoded = jwt.verify(
      tempResetToken,
      process.env.SECRET_KEY as string
    ) as { userId: string };

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error("User not found");

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Cleanup reset fields just in case
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;

    await user.save();
    res.clearCookie("tempResetToken", {
      httpOnly: true,
      sameSite: "lax",
    });
    await sendResetPwdSuccessfullyMail(user.email, user.username);

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const checkAuth = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) throw new Error("user not foud");
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(200).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const google = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, avatar } = req.body;
    // allow optional address/phone from google payload (if any)
    const { address = "", phone = "" } = req.body;
    let user: any = await User.findOne({ email }).lean();

    if (!user) {
      let password = Math.random().toString(36).slice(-8); // Generate a random 8-character password
      password = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        avatar,
        isVerified: true,
        address,
        phone,
      });
      user = newUser.toObject();
    }
    if (!user) throw new Error("Failed to create user");
    generateTokenAndSetCookie(res, user._id.toString());
    res.status(200).json({
      status: "success",
      message: "user logged in with google successfully",
      data: {
        ...user,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    await User.findByIdAndDelete(userId);
    res.clearCookie("auth-token");
    res.status(200).json({
      status: "success",
      message: "user account deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { username, oldPassword, newPassword, avatar, address, phone } =
      req.body;

    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: Partial<{
      username: string;
      avatar: string;
      address: string;
      phone: string;
      password: string;
    }> = {};

    // Update username if provided
    if (username) {
      updateData.username = username;
    }

    // Update avatar if provided
    if (avatar) {
      updateData.avatar = avatar;
    }

    // Update address / phone if provided
    if (address !== undefined) {
      updateData.address = address;
    }
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    // Handle password update
    if (newPassword) {
      if (!oldPassword) {
        throw new Error("Current password is required to set a new password");
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!isOldPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const getHouseOwner = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const houseId = req.params.id;
    const house = await House.findById(houseId).populate(
      "userRef",
      "-password"
    );
    if (!house) {
      res.status(404).json({
        status: "fail",
        message: "HOUSE NOT FOUND",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: house.userRef,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};
