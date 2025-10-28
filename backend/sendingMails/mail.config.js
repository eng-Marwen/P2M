
import nodemailer from 'nodemailer';

export const sendMail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_SERVICE_OWNER,
    pass: process.env.MAIL_SERVICE_PASSWORD,// Gmail App Password
  },
});

export const sender = {
  email: process.env.MAIL_SERVICE_OWNER,//the account that is linked with the service
  name: 'Marwen from Auth Project',
};


