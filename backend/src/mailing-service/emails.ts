import {
  PASSWORD_RESET_OTP_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { sendMail, sender } from "./mail.config.js";

export const sendVerificatinMail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  try {
    const response = await sendMail.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
    });
    console.log("email is sent successfully", response);
  } catch (error) {
    console.log("error send verification mail");
    throw new Error("error sending verification mail" + error);
  }
};

export const sendWemcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  try {
    const response = await sendMail.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "welcome to auth project",
      html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", name),
    });
    console.log("email is sent successfully", response);
  } catch (error) {
    console.log("error send welcome mail");
    throw new Error("error sending welcome mail:" + (error as Error).message);
  }
};

export const sendResetPasswordOtpEmail = async (
  otp: string,
  email: string,
  name: string
): Promise<void> => {
  try {
    const response = await sendMail.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: PASSWORD_RESET_OTP_TEMPLATE.replace("{otpCode}", otp).replace(
        "{userName}",
        name
      ),
    });
    console.log("Reset password OTP email sent successfully", response);
  } catch (error) {
    console.log("Error sending reset password OTP email:", error);
    throw new Error(
      "Error sending reset password OTP email: " + (error as Error).message
    );
  }
};

export const sendResetPwdSuccessfullyMail = async (
  email: string,
  name: string
): Promise<void> => {
  try {
    const response = await sendMail.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Password resetting",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{userName}", name),
    });
    console.log("Reset password success email sent successfully", response);
  } catch (error) {
    console.log("Error sending reset password success email:", error);
    throw new Error(
      "Error sending reset password successfully email: " +
        (error as Error).message
    );
  }
};
