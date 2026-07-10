import { User } from "../models/user.js";
import { generateOtp } from "../utils/generateOtp.js";
import { hashOtp } from "../utils/hashOtp.js";
import { sendOtpEmail } from "./otpService.js";

export const sendForgotPasswordOtp = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your account first");
  }

  const now = Date.now();

  if (user.otpLastSentAt && now - user.otpLastSentAt < 60 * 1000) {
    throw new Error("Please wait before requesting another OTP");
  }

  const otp = generateOtp();

  const hashedOtp = hashOtp(otp);

  user.otp = hashedOtp;
  user.otpExpires = now + 10 * 60 * 1000;
  user.otpAttempts = 0;
  user.otpLastSentAt = now;

  await user.save();

  await sendOtpEmail(user.email, otp, "forgot");

  return true;
};
