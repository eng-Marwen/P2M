import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
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
export const sendLinkForResettingPwd = async (token, email) => {
  const resetUrl = "http://localhost/api/auth/reset-password?token=" + token;
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: "Forgot Password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
  };

  try {
    const response = await sendMail.sendMail(mailOptions);
    console.log("Email is sent successfully to " + email, response.response);
  } catch (error) {
    console.log(" Error sending reset password email:", error);
    throw new Error("Error sending reset password email: " + error.message);
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
