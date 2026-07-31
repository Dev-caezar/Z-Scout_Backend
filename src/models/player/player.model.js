import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["player", "scout", "admin"],
      required: true,
    },

    verificationOTP: {
      type: String,
    },

    verificationOTPExpires: {
      type: Date,
    },
    passwordResetOTP: {
      type: String,
    },

    passwordResetOTPExpires: {
      type: Date,
    },

    lastOtpSentAt: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isPasswordResetVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);

export const playerModel = mongoose.model("players", playerSchema);
