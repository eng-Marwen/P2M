import  { MailtrapClient } from "mailtrap"
import dotenv from "dotenv"
dotenv.config();

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTARP_TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Marwen",
};


// const recipients = [
//   {
//     email: "marwen.boussabat@converty.shop",
//   }
// ];

//fomat***
// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text wela html: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);