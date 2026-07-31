import mongoose from "mongoose";
import { POSITIONS } from "../../constants.js";

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "players",
      required: true,
      unique: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    nationality: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Invalid phone number"],
    },

    primaryPosition: {
      type: String,
      enum: POSITIONS,
      required: true,
    },

    secondaryPosition: {
      type: String,
      enum: POSITIONS,
    },

    preferredFoot: {
      type: String,
      enum: ["Left", "Right", "Both"],
      required: true,
    },

    currentClubOrAcademy: {
      type: String,
      trim: true,
      default: "",
    },

    jerseyNumber: {
      type: Number,
      min: 1,
      max: 99,
    },

    height: {
      type: Number,
      required: true,
      min: 100,
      max: 250,
    },

    weight: {
      type: Number,
      required: true,
      min: 30,
      max: 200,
    },

    footballBio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    isAvailableForTrials: {
      type: Boolean,
      default: true,
    },

    willingToRelocate: {
      type: Boolean,
      default: false,
    },

    coach: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      phoneNumber: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },
    },

    medicalInformation: {
      currentInjury: {
        type: String,
        trim: true,
        default: "",
      },

      previousInjuries: {
        type: String,
        trim: true,
        default: "",
      },
    },

    profileStatus: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,

    socialLinks: {
      instagram: {
        type: String,
        trim: true,
        default: "",
      },
      facebook: {
        type: String,
        trim: true,
        default: "",
      },
      x: {
        type: String,
        trim: true,
        default: "",
      },
      youtube: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

export const profileModel = mongoose.model("profiles", playerSchema);
