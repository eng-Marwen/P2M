import {
  PASSWORD_RESET_OTP_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailjetClient, sender } from "./mail.config.js";

export const sendVerificatinMail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  try {
    console.log("📧 Attempting to send verification email to:", email);
    console.log("From:", sender.email);
    
    const request = mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: sender.email,
            Name: sender.name,
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: "Verify your email - Samsar ProMax",
          HTMLPart: VERIFICATION_EMAIL_TEMPLATE.replace(
            "{verificationCode}",
            verificationToken
          ),
        },
      ],
    });

    const response = await request;
    console.log("✅ Verification email sent successfully!");
    console.log("Message ID:", response.body.Messages[0].To[0].MessageID);
    console.log("Status:", response.body.Messages[0].Status);
  } catch (error: any) {
    console.error("❌ ERROR sending verification mail to:", email);
    console.error("Error message:", error.message);
    console.error("Error details:", error.statusCode, error.response?.body);
    throw new Error("Error sending verification mail: " + error.message);
  }
};

export const sendWemcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  try {
    console.log("📧 Sending welcome email to:", email);
    
    const request = mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: sender.email,
            Name: sender.name,
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: "Welcome to Samsar ProMax!",
          HTMLPart: WELCOME_EMAIL_TEMPLATE.replace("{userName}", name),
        },
      ],
    });

    const response = await request;
    console.log("✅ Welcome email sent successfully!");
  } catch (error: any) {
    console.error("❌ ERROR sending welcome mail:", error.message);
    throw new Error("Error sending welcome mail: " + error.message);
  }
};

export const sendResetPasswordOtpEmail = async (
  otp: string,
  email: string,
  name: string
): Promise<void> => {
  try {
    console.log("📧 Sending password reset OTP to:", email);
    
    const request = mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: sender.email,
            Name: sender.name,
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: "Password Reset Code - Samsar ProMax",
          HTMLPart: PASSWORD_RESET_OTP_TEMPLATE.replace("{otpCode}", otp).replace(
            "{userName}",
            name
          ),
        },
      ],
    });

    const response = await request;
    console.log("✅ Reset OTP email sent successfully!");
  } catch (error: any) {
    console.error("❌ ERROR sending reset OTP:", error.message);
    throw new Error("Error sending reset password OTP email: " + error.message);
  }
};

export const sendResetPwdSuccessfullyMail = async (
  email: string,
  name: string
): Promise<void> => {
  try {
    console.log("📧 Sending password reset success email to:", email);
    
    const request = mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: sender.email,
            Name: sender.name,
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: "Password Successfully Reset - Samsar ProMax",
          HTMLPart: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{userName}", name),
        },
      ],
    });

    const response = await request;
    console.log("✅ Reset success email sent successfully!");
  } catch (error: any) {
    console.error("❌ ERROR sending reset success email:", error.message);
    throw new Error("Error sending reset password success email: " + error.message);
  }
};
