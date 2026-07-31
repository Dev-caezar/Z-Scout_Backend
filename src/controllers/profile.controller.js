import { requiredFields, allowedFields } from "../constants.js";
import { playerModel } from "../models/player/player.model.js";
import { profileModel } from "../models/player/profile.model.js";
import cloudinary from "../config/cloudinary.js"; // ✅
import streamifier from "streamifier";
import { uploadToCloudinary } from "../utils/uploadToCloudnary.js";

const NESTED_FIELDS = ["coach", "medicalInformation", "socialLinks"];
const SENSITIVE_FIELDS =
  "-password -refreshToken -verificationOTP -verificationOTPExpires -passwordResetOTP -passwordResetOTPExpires";

export const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure the requester is actually a player account
    const player = await playerModel
      .findOne({ _id: userId, role: "player" })
      .select(SENSITIVE_FIELDS);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found.",
      });
    }

    // Find existing profile, if any (do NOT create it yet — creating with
    // only `user` set would fail schema validation since most fields are
    // required)
    let playerProfile = await profileModel.findOne({ user: userId });

    // Prevent editing after approval
    if (playerProfile?.profileStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Your profile has already been approved.",
      });
    }

    // Check for unknown fields
    const unknownFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field),
    );

    if (unknownFields.length) {
      return res.status(400).json({
        success: false,
        message: `Unknown field(s): ${unknownFields.join(", ")}`,
      });
    }

    // Validate required fields
    for (const field of requiredFields) {
      const value = req.body[field];

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`,
        });
      }
    }

    // Validate nested objects
    for (const field of NESTED_FIELDS) {
      if (
        req.body[field] !== undefined &&
        (typeof req.body[field] !== "object" || Array.isArray(req.body[field]))
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be an object.`,
        });
      }
    }

    // Build a fresh unsaved instance if this is the user's first submission
    if (!playerProfile) {
      playerProfile = new profileModel({ user: userId });
    }

    // Apply updates
    allowedFields.forEach((field) => {
      if (req.body[field] === undefined) return;

      if (NESTED_FIELDS.includes(field)) {
        playerProfile[field] = {
          ...(playerProfile[field]?.toObject?.() ?? playerProfile[field] ?? {}),
          ...req.body[field],
        };
      } else {
        playerProfile[field] = req.body[field];
      }
    });

    // Reset review state
    playerProfile.profileStatus = "submitted";
    playerProfile.reviewedBy = undefined;
    playerProfile.reviewedAt = undefined;
    playerProfile.rejectionReason = "";

    // Mark account profile as completed (i.e. submitted at least once —
    // does not imply approved)
    player.profileCompleted = true;

    // Save both
    await Promise.all([player.save(), playerProfile.save()]);

    return res.status(200).json({
      success: true,
      message: "Profile submitted successfully and is awaiting review.",
      data: {
        player,
        profile: playerProfile,
      },
    });
  } catch (error) {
    console.error("Complete Profile Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid value provided for '${error.path}'.`,
      });
    }

    // Duplicate profile creation race (two concurrent first-time submits)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists for this user.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error occurred.",
    });
  }
};

export const getPlayerProfile = async (req, res) => {
  try {
    const playerId = req.user.id;
    const player = await playerModel
      .findOne({ _id: playerId, role: "player" })
      .select(SENSITIVE_FIELDS);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found.",
      });
    }

    const playerProfile = await profileModel.findOne({ user: playerId });

    return res.status(200).json({
      success: true,
      message: "Player's profile retrived successfully",
      data: {
        player,
        profile: playerProfile, // null if the player hasn't submitted one yet
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      success: false,
      message: error || "Internal server error occurred.",
    });
  }
};

export const uploadPlayerImages = async (req, res) => {
  try {
    const playerId = req.user.id;

    const profile = await profileModel.findOne({
      user: playerId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const profileImage = req.files?.profileImage?.[0];
    const coverImage = req.files?.coverImage?.[0];

    if (!profileImage && !coverImage) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload at least one image (profileImage or coverImage).",
      });
    }

    // Upload profile image
    if (profileImage) {
      if (profile.profileImagePublicId) {
        await cloudinary.uploader.destroy(profile.profileImagePublicId);
      }

      const uploadedProfile = await uploadToCloudinary(
        profileImage.buffer,
        "zscouts/profile-images",
      );

      profile.profileImage = uploadedProfile.secure_url;
      profile.profileImagePublicId = uploadedProfile.public_id;
    }

    // Upload cover image
    if (coverImage) {
      if (profile.coverImagePublicId) {
        await cloudinary.uploader.destroy(profile.coverImagePublicId);
      }

      const uploadedCover = await uploadToCloudinary(
        coverImage.buffer,
        "zscouts/cover-images",
      );

      profile.coverImage = uploadedCover.secure_url;
      profile.coverImagePublicId = uploadedCover.public_id;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully.",
      data: {
        profileImage: profile.profileImage,
        coverImage: profile.coverImage,
      },
    });
  } catch (error) {
    console.error("Upload Images Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error occurred.",
    });
  }
};
