import { loadTemplate } from "./loadTemplate.js";

export const emailTemplates = {
  verify: (otp) => ({
    subject: "Verify your account",
    html: loadTemplate("verify.html", { OTP: otp }),
  }),

  forgot: (otp) => ({
    subject: "Password Reset OTP",
    html: loadTemplate("forgot.html", { OTP: otp }),
  }),
};
