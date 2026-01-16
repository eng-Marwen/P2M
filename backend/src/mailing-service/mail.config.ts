import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Mailjet = require("node-mailjet");

interface Sender {
  email: string;
  name: string;
}

const mailjetClient = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY as string,
  process.env.MAILJET_SECRET_KEY as string
);

export { mailjetClient };

export const sender: Sender = {
  email: "support@prmax.me",
  name: "Support Team From Samsar ProMax",
};
