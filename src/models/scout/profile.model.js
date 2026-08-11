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

    // --- Identity & credibility ---
    isIndependent: {
      type: Boolean,
      required: true,
      default: false,
    },

    organizationName: {
      type: String,
      trim: true,
      // Only required if they're NOT independent
      required: function () {
        return this.isIndependent === false;
      },
      default: "",
    },

    title: {
      type: String,
      trim: true,
      // e.g. "Head Scout", "Regional Scout", "Freelance Scout"
      required: true,
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 60,
      required: true,
    },

    // --- Location & coverage ---
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

    // --- Contact ---
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Invalid phone number"],
    },

    // --- Verification ---
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

    // Optional for everyone, but especially useful for independent scouts
    // with no org badge to lean on — a LinkedIn profile, personal site,
    // or a reference letter/portfolio link.
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

    // --- Review workflow (same pattern as player profiles) ---
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
