import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_OTP_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";
import { sendMail, sender } from "./mail.config.js";

export const sendVerificatinMail = async (email, verificationToken) => {
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
export const sendWemcomeEmail = async (email, name) => {
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
    throw new Error("error sending welcome mail:" + error.message);
  }
};
export const sendResetPasswordOtpEmail = async (otp,email) => {
  try {
    const response = await sendMail.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: PASSWORD_RESET_OTP_TEMPLATE.replace("{otpCode}", otp),
    });
    console.log("Reset password OTP email sent successfully", response);
  } catch (error) {
    console.log("Error sending reset password OTP email:", error);
    throw new Error("Error sending reset password OTP email: " + error.message);
  }
};

export const sendResetPwdSuccessfullyMail = async (email) => {
  try {
    const mailOptions = {
      from: sender.email,
      to: email,
      subject: "Password resetting",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE
    };
    const response = await sendMail.sendMail(mailOptions);
  } catch (error) {
    throw new Error(
      "Error sending reset password successfully email: " + error.message
    );
  }
};
//TODO; send reset password email with otp code
