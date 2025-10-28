import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import {
  sendLinkForResettingPwd,
  sendResetPwdSuccessfullyMail,
  sendVerificatinMail,
  sendWemcomeEmail,
} from "../sendingMails/emails.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
  try {
    let { email, lastname, name, password } = req.body;
    if (!email || !password) {
      throw new Error("EMAIL AND PASSWORD ARE REQUIRED!");
    }
    const isExisted = await User.findOne({ email });
    if (isExisted && isExisted.isVerified)
      throw new Error("USER ALREADY EXISTS");
    const verificationToken = Math.floor(100000 + Math.random() * 900000); //6 digits code

    const verificationTokenExpiresAt = new Date(Date.now() + 3600 * 1000 * 24); // This sets the expiration time to 24 hour(in ms) from now
    let user
    password = await bcrypt.hash(password, 10);
    if (isExisted && !isExisted.isVerified) {
       user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            name,
            lastname,
            password,
            verificationToken,
            verificationTokenExpiresAt,
          },
        },
        { new: true }
      );
    } else {
       user = await User.create({
        name,
        lastname,
        email,
        password,
        verificationToken,
        verificationTokenExpiresAt,
      });
    }
    //jwt
    generateTokenAndSetCookie(res, user._id);
    await sendVerificatinMail(user.email, verificationToken);
    res.status(201).json({
      status: "success",
      message: "user created successfully",
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
    await sendWemcomeEmail(user.email, user.name);
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    res.status(200).json({
      status: "success",
      message: "email verified successfully",
      data: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
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
    const user = await User.findOne({ email });
    if (!user) throw new Error("user does not exit please signup");
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("invalid password");
    generateTokenAndSetCookie(res, user.id);
    const id = user.id;
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
