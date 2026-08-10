import mongoose from "mongoose";

const scoutProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "scouts",
      required: true,
      unique: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Identity & credibility
    isIndependent: {
      type: Boolean,
      required: true,
      default: false,
    },

    organizationName: {
      type: String,
      trim: true,
      default: "",
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 60,
      default: null,
    },

    // Location & coverage
    nationality: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    regionsCovered: {
      type: [String],
      default: [],
    },

    // Contact
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Invalid phone number"],
      default: "",
    },

    // Verification
    proofOfAffiliation: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    referenceLink: {
      type: String,
      trim: true,
      default: "",
    },

    linkedIn: {
      type: String,
      trim: true,
      default: "",
    },

    profileStatus: {
      type: String,
      enum: ["draft", "incomplete", "submitted", "approved", "rejected"],
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
      ref: "admins",
    },

    reviewedAt: Date,
  },
  {
    timestamps: true,
  },
);

export const scoutProfileModel = mongoose.model(
  "scoutProfiles",
  scoutProfileSchema,
);
