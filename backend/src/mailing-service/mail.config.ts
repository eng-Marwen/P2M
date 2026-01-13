import nodemailer, { Transporter } from "nodemailer";

interface Sender {
  email: string;
  name: string;
}

interface Auth {
  user: string;
  pass: string;
}

export const sendMail: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_SERVICE_OWNER as string,
    pass: process.env.MAIL_SERVICE_PASSWORD as string, // Gmail App Password
  },
});

export const sender: Sender = {
  email: process.env.MAIL_SERVICE_OWNER as string, //the account that is linked with the service
  name: "Marwen from Auth Project",
};
