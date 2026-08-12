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

    isIndependent: {
      type: Boolean,
      required: true,
      default: false,
    },

    organizationName: {
      type: String,
      trim: true,
      required: function () {
        return this.isIndependent === false;
      },
      default: "",
    },

    title: {
      type: String,
      trim: true,
      required: true,
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 60,
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

    regionsCovered: {
      type: [String],
      default: [],
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Invalid phone number"],
    },

    proofOfAffiliation: {
      url: {
        type: String,
        default: "",
        required: function () {
          return this.isIndependent === false;
        },
      },
      publicId: { type: String, default: "" },
    },

    ageGroupsOfInterest: {
      type: [String],
      default: []
    },
    positionsOfInterest: {
      type: [String],
      default: []
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
