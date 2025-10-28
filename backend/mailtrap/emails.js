import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificatinMail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    const response = mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "email verification",
    });
    console.log("email is sent successfully", response);
  } catch (error) {
    console.log("error send verification mail");
    throw new Error("error sending verification mail" + error);
  }
};
export const sendWemcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    const response = mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "9944185f-bbe8-4869-8d51-d9f809a57063",
      template_variables: {
        company_info_name: "AUTH Project",
        name: name,
      },
    });
    console.log("email is sent successfully", response);
  } catch (error) {
    console.log("error send verification mail");
    throw new Error("error sending verification mail" + error);
  }
};
