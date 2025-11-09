import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import House from "../models/house.model.js"
import {
  sendLinkForResettingPwd,
  sendResetPwdSuccessfullyMail,
  sendVerificatinMail,
  sendWemcomeEmail,
} from "../sendingMails/emails.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
  try {
    let { email, username, password, address = "", phone = "" } = req.body;

    if (!email || !password || !username) {
      throw new Error("EMAIL, USERNAME AND PASSWORD ARE REQUIRED!");
    }

    const isExisted = await User.findOne({ email });
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
    await sendVerificatinMail(user.email, verificationToken);
    res.status(201).json({
      status: "success",
      message: "verification email sent successfully",
      data: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const verifyMail = async (req, res) => {
  //1 2 3 6 8 7 form the frontend
  try {
    const { code } = req.body;
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "invalid or expired verification code",
      });
    }
    await sendWemcomeEmail(user.email, user.username);
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    generateTokenAndSetCookie(res, user._id);
    res.status(200).json({
      status: "success",
      message: "email verified successfully",
      data: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.clearCookie("auth-token");
    console.log("error in send verification mail");
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
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
    user.lastLogin = Date.now();
    await user.save();
    res.status(200).json({
      status: "success",
      message: "user logged in successfully",
      data: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("auth-token");
  res.status(200).json({
    status: "success",
    message: "user logged out successfully",
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("invalid email");
    const resetPasswordToken = crypto.randomBytes(10).toString("hex");
    const resetPasswordTokenExpiresAt = Date.now() + 15 * 60 * 1000; //15min

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;
    await user.save();

    await sendLinkForResettingPwd(resetPasswordToken, user.email);
    res.status(200).json({
      status: "success",
      message: "verification mail sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    let { newPassword } = req.body;
    if (!token || !newPassword)
      throw new Error("missing token or the new password");
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) throw new Error("Invalid or expired token");
    newPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    await user.save();
    await sendResetPwdSuccessfullyMail(user.email);
    res.status(200).json({
      status: "success",
      message: "password updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
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
      message: error.message,
    });
  }
};

export const google = async (req, res) => {
  try {
    const { email, username, avatar } = req.body;
    // allow optional address/phone from google payload (if any)
    const { address = "", phone = "" } = req.body;
    let user = await User.findOne({ email }).lean();

    if (!user) {
      let password = Math.random().toString(36).slice(-8); // Generate a random 8-character password
      password = await bcrypt.hash(password, 10);
      user = await User.create({
        username: username.split(" ").join("").toLowerCase(),
        email,
        password,
        avatar,
        isVerified: true,
        address,
        phone,
      });
    }
    generateTokenAndSetCookie(res, user._id);
    user = user._doc || user; //in case of new user created
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
      message: error.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
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
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, oldPassword, newPassword, avatar, address, phone } = req.body;

    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData = {};

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
      message: error.message,
    });
  }
};

export const getHouseOwner= async (req, res) => {
  try {
    const houseId = req.params.id;
    const house = await House.findById(houseId).populate('userRef', '-password');
    if (!house) {
      return res.status(404).json({
        status: "fail",
        message: "HOUSE NOT FOUND",
      });
    }
    res.status(200).json({
      status: "success",
      data: house.userRef,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
}