import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import { uploadDocument } from "../middleware/upload-document.middleware.js";
import { completeScoutProfile, uploadProofOfAffiliation, getScoutProfile, updateScoutingInterest, browsePlayers } from "../controllers/scout.controller.js";

const router = Router();

/**
 * @swagger
 * /scout/profile:
 *   get:
 *     tags:
 *       - Scout Profile
 *     summary: Get authenticated scout's profile
 *     description: >
 *       Retrieves the authenticated scout's account information together
 *       with their profile details. If the scout has not completed their
 *       profile yet, the profile field will return null.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Scout profile retrieved successfully.
 *         content:
 *           application/json:
 *             examples:
 *               profileExists:
 *                 summary: Scout with a submitted/reviewed profile
 *                 value:
 *                   success: true
 *                   data:
 *                     scout:
 *                       _id: "68a1f2c3d9f2a5f2b5b7b12"
 *                       firstName: "Aruora"
 *                       lastName: "Emmanuel"
 *                       email: "scout@example.com"
 *                       role: "scout"
 *                       isVerified: true
 *                       profileCompleted: true
 *                       createdAt: "2026-07-30T10:20:00.000Z"
 *                     profile:
 *                       isIndependent: false
 *                       organizationName: "Future Stars Academy"
 *                       title: "Regional Scout"
 *                       yearsOfExperience: 5
 *                       bio: "Passionate about discovering young talent across West Africa."
 *                       nationality: "Nigerian"
 *                       state: "Lagos"
 *                       city: "Ikeja"
 *                       regionsCovered: ["Southwest Nigeria", "Lagos"]
 *                       phoneNumber: "+2348012345678"
 *                       proofOfAffiliation:
 *                         url: "https://res.cloudinary.com/demo/image/upload/v1/zscouts/scout-affiliation-proof/badge.jpg"
 *                         publicId: "zscouts/scout-affiliation-proof/badge"
 *                       referenceLink: ""
 *                       linkedIn: "https://linkedin.com/in/scoutname"
 *                       ageGroupsOfInterest: ["U17", "U20"]
 *                       positionsOfInterest: ["Striker", "Winger"]
 *                       profileStatus: "submitted"
 *                       visibility: "public"
 *                       rejectionReason: ""
 *               noProfileYet:
 *                 summary: Scout who hasn't completed their profile yet
 *                 value:
 *                   success: true
 *                   data:
 *                     scout:
 *                       _id: "68a1f2c3d9f2a5f2b5b7b12"
 *                       firstName: "Aruora"
 *                       lastName: "Emmanuel"
 *                       email: "scout@example.com"
 *                       role: "scout"
 *                       isVerified: true
 *                       profileCompleted: false
 *                       createdAt: "2026-07-30T10:20:00.000Z"
 *                     profile: null
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
 *         description: Scout not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Scout not found."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.get("/profile", protect, getScoutProfile);

/**
 * @swagger
 * /scout/profile:
 *   patch:
 *     tags:
 *       - Scout Profile
 *     summary: Complete scout profile
 *     description: >
 *       Allows an authenticated scout to complete their profile. The
 *       profile is submitted for review and its status is changed to
 *       "submitted". If `isIndependent` is false, `organizationName`
 *       becomes required, and a proof of affiliation must already have
 *       been uploaded via /scout/profile/affiliation-proof before this
 *       request will succeed. Once a profile has been approved it can
 *       no longer be edited through this endpoint.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             affiliatedScout:
 *               summary: Scout representing an organization
 *               value:
 *                 isIndependent: false
 *                 organizationName: "Future Stars Academy"
 *                 title: "Regional Scout"
 *                 yearsOfExperience: 5
 *                 bio: "Passionate about discovering young talent across West Africa."
 *                 nationality: "Nigerian"
 *                 state: "Lagos"
 *                 city: "Ikeja"
 *                 regionsCovered: ["Southwest Nigeria", "Lagos"]
 *                 phoneNumber: "+2348012345678"
 *                 referenceLink: ""
 *                 linkedIn: "https://linkedin.com/in/scoutname"
 *             independentScout:
 *               summary: Independent scout (no affiliation proof required)
 *               value:
 *                 isIndependent: true
 *                 title: "Freelance Scout"
 *                 yearsOfExperience: 3
 *                 bio: "Independent scout focused on grassroots talent."
 *                 nationality: "Nigerian"
 *                 state: "Oyo"
 *                 city: "Ibadan"
 *                 regionsCovered: ["Southwest Nigeria"]
 *                 phoneNumber: "+2348023456789"
 *                 referenceLink: "https://linkedin.com/in/scoutname"
 *                 linkedIn: "https://linkedin.com/in/scoutname"
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
 *                 scout:
 *                   _id: "68a1f2c3d9f2a5f2b5b7b12"
 *                   firstName: "Aruora"
 *                   lastName: "Emmanuel"
 *                   email: "scout@example.com"
 *                   profileCompleted: true
 *                 profile:
 *                   profileStatus: "submitted"
 *                   isIndependent: false
 *                   organizationName: "Future Stars Academy"
 *                   title: "Regional Scout"
 *
 *       400:
 *         description: Validation error, missing required field, unknown field, or missing proof of affiliation.
 *         content:
 *           application/json:
 *             examples:
 *               missingField:
 *                 value:
 *                   success: false
 *                   message: "phoneNumber is required."
 *               invalidField:
 *                 value:
 *                   success: false
 *                   message: "Unknown field(s): favoriteColor"
 *               missingOrgName:
 *                 value:
 *                   success: false
 *                   message: "organizationName is required."
 *               missingProof:
 *                 value:
 *                   success: false
 *                   message: "Proof of affiliation is required for scouts representing an organization. Please upload it before submitting."
 *               approvedProfile:
 *                 value:
 *                   success: false
 *                   message: "Your profile has already been approved."
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
 *         description: Scout not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Scout not found."
 *
 *       409:
 *         description: Profile already exists for this scout (concurrent first-submission race).
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Profile already exists for this scout."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.patch("/profile", protect, completeScoutProfile);

/**
 * @swagger
 * /scout/profile/affiliation-proof:
 *   patch:
 *     tags:
 *       - Scout Profile
 *     summary: Upload proof of affiliation
 *     description: >
 *       Uploads or replaces the document/image proving the scout's
 *       affiliation with the organization they represent. Only applies
 *       to scouts where `isIndependent` is false — independent scouts
 *       will receive a 400. Should be called before submitting the main
 *       profile via PATCH /scout/profile, since that endpoint checks
 *       that a proof has already been uploaded.
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
 *               - proofOfAffiliation
 *             properties:
 *               proofOfAffiliation:
 *                 type: string
 *                 format: binary
 *                 description: JPG, PNG, WebP, or PDF file. Max 10MB.
 *
 *     responses:
 *       200:
 *         description: Proof of affiliation uploaded successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Proof of affiliation uploaded successfully."
 *               data:
 *                 proofOfAffiliation:
 *                   url: "https://res.cloudinary.com/demo/image/upload/v1/zscouts/scout-affiliation-proof/badge.jpg"
 *                   publicId: "zscouts/scout-affiliation-proof/badge"
 *
 *       400:
 *         description: >
 *           Missing file, invalid file type/size, profile not found yet,
 *           or the scout is independent (proof does not apply to them).
 *         content:
 *           application/json:
 *             examples:
 *               missingFile:
 *                 value:
 *                   success: false
 *                   message: "Please upload a file (image or PDF)."
 *               tooLarge:
 *                 value:
 *                   success: false
 *                   message: "File is too large (max 10MB)."
 *               invalidType:
 *                 value:
 *                   success: false
 *                   message: "Only JPG, PNG, WebP, or PDF files are allowed."
 *               independentScout:
 *                 value:
 *                   success: false
 *                   message: "Proof of affiliation only applies to scouts representing an organization."
 *               approvedProfile:
 *                 value:
 *                   success: false
 *                   message: "Your profile has already been approved."
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
 *         description: Profile not found — complete the profile first.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Profile not found. Complete your profile first."
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
  "/profile/affiliation-proof",
  protect,
  (req, res, next) => {
    uploadDocument.single("proofOfAffiliation")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message:
            err.code === "LIMIT_FILE_SIZE"
              ? "File is too large (max 10MB)."
              : err.message,
        });
      }
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Invalid file upload.",
        });
      }
      next();
    });
  },
  uploadProofOfAffiliation,
);

/**
 * @swagger
 * /scout/profile/interests:
 *   patch:
 *     tags:
 *       - Scout Profile
 *     summary: Update scouting interests
 *     description: >
 *       Updates the authenticated scout's age-group and position interests.
 *       Unlike PATCH /scout/profile, this endpoint does NOT change
 *       profileStatus, reviewedBy, reviewedAt, or rejectionReason —
 *       interests are freely editable at any time, independent of
 *       approval status, since a scout's focus is expected to change
 *       over their career (e.g. starting with U17 only, later expanding
 *       to all age groups).
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             ageGroupsOfInterest: ["U17", "U20"]
 *             positionsOfInterest: ["Striker", "Winger"]
 *
 *     responses:
 *       200:
 *         description: Scouting interests updated.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Scouting interests updated."
 *               data:
 *                 ageGroupsOfInterest: ["U17", "U20"]
 *                 positionsOfInterest: ["Striker", "Winger"]
 *
 *       400:
 *         description: Unknown field(s), or a field sent in the wrong shape.
 *         content:
 *           application/json:
 *             examples:
 *               unknownField:
 *                 value:
 *                   success: false
 *                   message: "Unknown field(s): favoritePosition"
 *               wrongShape:
 *                 value:
 *                   success: false
 *                   message: "ageGroupsOfInterest must be an array of strings."
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
 *         description: Profile not found — complete the profile first.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Profile not found. Complete your profile first."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.patch("/profile/interests", protect, updateScoutingInterest);

/**
 * @swagger
 * /scout/players/browse:
 *   get:
 *     tags:
 *       - Scout - Player Browsing
 *     summary: Browse approved players
 *     description: >
 *       Returns a paginated list of approved, publicly visible player
 *       profiles for the authenticated scout to browse. Supports
 *       filtering by position, age group, nationality, availability for
 *       trials, and a name search. Only a limited, non-sensitive set of
 *       fields is returned (no medical information, coach contact
 *       details, or social links).
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive partial match against the player's first or last name.
 *         example: "David"
 *       - in: query
 *         name: positions
 *         schema:
 *           type: string
 *         description: >
 *           Comma-separated list of positions. Matches either the player's
 *           primaryPosition or secondaryPosition.
 *         example: "Striker,Winger"
 *       - in: query
 *         name: ageGroups
 *         schema:
 *           type: string
 *         description: >
 *           Comma-separated list of age group buckets, computed from the
 *           player's dateOfBirth. Valid values: U15, U17, U20, Senior.
 *         example: "U17,U20"
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *         description: Case-insensitive partial match against nationality.
 *         example: "Nigerian"
 *       - in: query
 *         name: availableForTrialsOnly
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: If "true", only returns players with isAvailableForTrials set to true.
 *         example: "true"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number, 1-indexed.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Results per page. Capped at 50.
 *
 *     responses:
 *       200:
 *         description: Paginated list of matching players.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 players:
 *                   - _id: "68912f4c3d9f2a5f2b5b7b12"
 *                     firstName: "David"
 *                     lastName: "Okoro"
 *                     profileImage: "https://res.cloudinary.com/demo/image/upload/v1/zscouts/profile-images/david.jpg"
 *                     primaryPosition: "Striker"
 *                     secondaryPosition: "Winger"
 *                     age: 17
 *                     nationality: "Nigerian"
 *                     state: "Lagos"
 *                     city: "Ikeja"
 *                     currentClubOrAcademy: "Future Stars Academy"
 *                     isAvailableForTrials: true
 *                     willingToRelocate: false
 *                 pagination:
 *                   page: 1
 *                   limit: 12
 *                   total: 42
 *                   totalPages: 4
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.get("/players/browse", protect, browsePlayers);

export default router;