import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },

    nationality: {
      type: String,
      default: "Nigeria",
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
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    primaryPosition: {
      type: String,
      required: true,
      enum: [
        "Goalkeeper",
        "Centre Back",
        "Right Back",
        "Left Back",
        "Defensive Midfielder",
        "Central Midfielder",
        "Attacking Midfielder",
        "Right Winger",
        "Left Winger",
        "Striker",
      ],
    },

    secondaryPosition: {
      type: String,
      enum: [
        "Goalkeeper",
        "Centre Back",
        "Right Back",
        "Left Back",
        "Defensive Midfielder",
        "Central Midfielder",
        "Attacking Midfielder",
        "Right Winger",
        "Left Winger",
        "Striker",
      ],
    },

    preferredFoot: {
      type: String,
      enum: ["Left", "Right", "Both"],
      required: true,
    },

    currentClub: {
      type: String,
      trim: true,
      default: "",
    },

    jerseyNumber: {
      type: Number,
      min: 1,
      max: 99,
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },

    height: {
      type: Number, // cm
      required: true,
    },

    weight: {
      type: Number, // kg
      required: true,
    },

    stats: {
      appearances: {
        type: Number,
        default: 0,
      },

      goals: {
        type: Number,
        default: 0,
      },

      assists: {
        type: Number,
        default: 0,
      },

      cleanSheets: {
        type: Number,
        default: 0,
      },
    },

    achievements: [
      {
        title: {
          type: String,
          trim: true,
        },

        organization: {
          type: String,
          trim: true,
        },

        year: {
          type: Number,
        },
      },
    ],

    highlightVideos: [
      {
        type: String,
      },
    ],

    gallery: [
      {
        type: String,
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

playerSchema.index({ primaryPosition: 1 });
playerSchema.index({ secondaryPosition: 1 });
playerSchema.index({ nationality: 1 });
playerSchema.index({ state: 1 });
playerSchema.index({ city: 1 });
playerSchema.index({ preferredFoot: 1 });
playerSchema.index({ currentClub: 1 });
playerSchema.index({ isAvailable: 1 });

export const Player = mongoose.model("Player", playerSchema);
