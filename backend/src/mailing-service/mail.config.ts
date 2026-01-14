import nodemailer, { Transporter } from "nodemailer";

interface Sender {
  email: string;
  name: string;
}

export const sendMail: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_SERVICE_OWNER as string,
    pass: process.env.MAIL_SERVICE_PASSWORD as string,
  },
});

export const sender: Sender = {
  email: process.env.MAIL_SERVICE_OWNER as string,
  name: "Support Team From Samsar ProMax",
};
