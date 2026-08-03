import { Router } from "express";
import {
  completeProfile,
  getPlayerProfile,
  getPlayerVideos,
  updatePlayerVideo,
  uploadPlayerImages,
  uploadPlayerVideo,
} from "../controllers/player.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload-image.middleware.js";
import { uploadVideo } from "../middleware/upload-video.middleware.js";
import multer from "multer";

const router = Router();

/**
 * @swagger
 * /player/profile:
 *   patch:
 *     tags:
 *       - Player Profile
 *     summary: Complete player profile
 *     description: >
 *       Allows an authenticated player to complete their profile.
 *       The profile is submitted for review and its status is changed
 *       to "submitted". Once a profile has been approved it can no
 *       longer be edited through this endpoint.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             profileImage: "https://example.com/profile.jpg"
 *             coverImage: "https://example.com/cover.jpg"
 *             bio: "Passionate football player."
 *             dateOfBirth: "2003-05-14"
 *             gender: "male"
 *             nationality: "Nigerian"
 *             state: "Lagos"
 *             city: "Ikeja"
 *             phoneNumber: "+2348012345678"
 *             primaryPosition: "Striker"
 *             secondaryPosition: "Left Winger"
 *             preferredFoot: "Right"
 *             currentClubOrAcademy: "Future Stars Academy"
 *             jerseyNumber: 9
 *             height: 178
 *             weight: 70
 *             footballBio: "Fast attacker with excellent finishing ability."
 *             isAvailableForTrials: true
 *             willingToRelocate: false
 *             coach:
 *               name: "John Doe"
 *               phoneNumber: "+2348000000000"
 *               email: "coach@example.com"
 *             medicalInformation:
 *               currentInjury: ""
 *               previousInjuries: "Minor ankle sprain (2022)"
 *             socialLinks:
 *               instagram: "https://instagram.com/playerhandle"
 *               facebook: ""
 *               x: ""
 *               youtube: ""
 *
 *     responses:
 *       200:
 *         description: Profile submitted successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Profile submitted successfully and is awaiting review."
 *               data:
 *                 player:
 *                   _id: "68912f4c3d9f2a5f2b5b7b12"
 *                   firstName: "Michael"
 *                   lastName: "John"
 *                   email: "player@example.com"
 *                   profileCompleted: true
 *                 profile:
 *                   profileStatus: "submitted"
 *                   primaryPosition: "Striker"
 *                   preferredFoot: "Right"
 *
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             examples:
 *               missingField:
 *                 value:
 *                   success: false
 *                   message: "dateOfBirth is required."
 *
 *               invalidField:
 *                 value:
 *                   success: false
 *                   message: "Unrecognized field(s): favoriteColor"
 *
 *               approvedProfile:
 *                 value:
 *                   success: false
 *                   message: "Your profile has already been approved."
 *
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "Invalid phone number."
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized."
 *
 *       404:
 *         description: Player or profile not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Player profile not found."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.patch("/profile", protect, completeProfile);

/**
 * @swagger
 * /player/profile:
 *   get:
 *     tags:
 *       - Player Profile
 *     summary: Get authenticated player's profile
 *     description: >
 *       Retrieves the authenticated player's account information
 *       together with their profile details. If the player has not
 *       completed their profile yet, the profile field will return null.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Player profile retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 player:
 *                   _id: "68912f4c3d9f2a5f2b5b7b12"
 *                   firstName: "Michael"
 *                   lastName: "John"
 *                   username: "michaeljohn"
 *                   email: "player@example.com"
 *                   role: "player"
 *                   isVerified: true
 *                   profileCompleted: true
 *                   createdAt: "2025-07-30T10:20:00.000Z"
 *                 profile:
 *                   profileImage: "https://example.com/profile.jpg"
 *                   coverImage: "https://example.com/cover.jpg"
 *                   bio: "Passionate football player."
 *                   dateOfBirth: "2003-05-14T00:00:00.000Z"
 *                   gender: "male"
 *                   nationality: "Nigerian"
 *                   state: "Lagos"
 *                   city: "Ikeja"
 *                   phoneNumber: "+2348012345678"
 *                   primaryPosition: "Striker"
 *                   secondaryPosition: "Left Winger"
 *                   preferredFoot: "Right"
 *                   currentClubOrAcademy: "Future Stars Academy"
 *                   jerseyNumber: 9
 *                   height: 178
 *                   weight: 70
 *                   footballBio: "Fast attacker with excellent finishing ability."
 *                   isAvailableForTrials: true
 *                   willingToRelocate: false
 *                   profileStatus: "submitted"
 *                   visibility: "public"
 *                   coach:
 *                     name: "John Doe"
 *                     phoneNumber: "+2348000000000"
 *                     email: "coach@example.com"
 *                   medicalInformation:
 *                     currentInjury: ""
 *                     previousInjuries: "Minor ankle sprain (2022)"
 *                   socialLinks:
 *                     instagram: "https://instagram.com/playerhandle"
 *                     facebook: ""
 *                     x: ""
 *                     youtube: ""
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized."
 *
 *       404:
 *         description: Player not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Player not found."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.get("/profile", protect, getPlayerProfile);

/**
 * @swagger
 * /player/profile/images:
 *   patch:
 *     tags:
 *       - Player Profile
 *     summary: Upload player profile and cover images
 *     description: >
 *       Uploads or replaces the authenticated player's profile image,
 *       cover image, or both. Existing images are automatically replaced
 *       in Cloudinary.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Player profile picture.
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Player cover picture.
 *
 *     responses:
 *       200:
 *         description: Images uploaded successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Images uploaded successfully."
 *               data:
 *                 profileImage: "https://res.cloudinary.com/demo/image/upload/profile.jpg"
 *                 coverImage: "https://res.cloudinary.com/demo/image/upload/cover.jpg"
 *
 *       400:
 *         description: No images were uploaded.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Please upload at least one image (profileImage or coverImage)."
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized."
 *
 *       404:
 *         description: Profile not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Profile not found."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.patch(
  "/profile/images",
  protect,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  uploadPlayerImages,
);

/**
 * @swagger
 * /player/videos:
 *   post:
 *     tags:
 *       - Player Profile
 *     summary: Upload a player highlight video
 *     description: >
 *       Uploads a single video for the authenticated player. The player's
 *       profile must already be approved before videos can be uploaded.
 *       Each video is created with status "pending" and is not visible
 *       to scouts until reviewed and approved by an admin.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *               - title
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (mp4, mov, or webm). Max 100MB.
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Match highlights vs Rivers United"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Full match highlights from the regional trial showcase."
 *
 *     responses:
 *       201:
 *         description: Video uploaded successfully and is awaiting review.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Video uploaded successfully and is awaiting review."
 *               data:
 *                 _id: "68a1f2c3d9f2a5f2b5b7b99"
 *                 player: "68912f4c3d9f2a5f2b5b7b12"
 *                 uploadedBy: "68912f4c3d9f2a5f2b5b7b12"
 *                 title: "Match highlights vs Rivers United"
 *                 description: "Full match highlights from the regional trial showcase."
 *                 videoUrl: "https://res.cloudinary.com/demo/video/upload/v1/zscouts/player-videos/highlight.mp4"
 *                 publicId: "zscouts/player-videos/highlight"
 *                 thumbnailUrl: "https://res.cloudinary.com/demo/video/upload/v1/zscouts/player-videos/highlight.jpg"
 *                 duration: 42
 *                 status: "pending"
 *                 visibility: "public"
 *                 views: 0
 *                 isDeleted: false
 *                 createdAt: "2026-08-03T10:20:00.000Z"
 *
 *       400:
 *         description: >
 *           Missing video file, missing title, invalid file type/size,
 *           or the player has reached their video upload limit.
 *         content:
 *           application/json:
 *             examples:
 *               missingFile:
 *                 value:
 *                   success: false
 *                   message: "Please upload a video file."
 *               missingTitle:
 *                 value:
 *                   success: false
 *                   message: "title is required."
 *               tooLarge:
 *                 value:
 *                   success: false
 *                   message: "Video file is too large (max 100MB)."
 *               invalidType:
 *                 value:
 *                   success: false
 *                   message: "Only MP4, MOV, or WebM video files are allowed."
 *               limitReached:
 *                 value:
 *                   success: false
 *                   message: "You can only have up to 10 videos. Delete an existing video before uploading a new one."
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized."
 *
 *       403:
 *         description: Profile has not been approved yet.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Your profile must be approved before uploading videos."
 *
 *       404:
 *         description: Profile not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Profile not found."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.post(
  "/videos",
  protect,
  (req, res, next) => {
    uploadVideo.single("video")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message:
            err.code === "LIMIT_FILE_SIZE"
              ? "Video file is too large (max 100MB)."
              : err.message,
        });
      }
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Invalid video upload.",
        });
      }
      next();
    });
  },
  uploadPlayerVideo,
);

router.get("/videos", protect, getPlayerVideos);
router.patch("/videos/:videoId", protect, updatePlayerVideo);

export default router;
