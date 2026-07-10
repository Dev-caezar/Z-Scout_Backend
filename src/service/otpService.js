import { emailTemplates } from "../utils/emailTemplates.js";
import { sendSingleEmail } from "./emailService.js";

export const sendOtpEmail = async (email, otp, type = "verify") => {
  const template = emailTemplates[type];

  if (!template) {
    throw new Error("Invalid email type");
  }

  const { subject, html } = template(otp);

  await sendSingleEmail({
    email,
    subject,
    html,
  });
};
