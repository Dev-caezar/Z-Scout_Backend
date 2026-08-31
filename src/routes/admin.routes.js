import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/requireAdmin.middleware.js";
import {
    getPendingPlayerProfiles,
    approvePlayerProfile,
    rejectPlayerProfile,
    getPendingScoutProfiles,
    approveScoutProfile,
    rejectScoutProfile,
} from "../controllers/adminReview.controller.js";
import { createAdmin } from "../controllers/auth.controller.js";

const router = Router();

// Every route here requires BOTH a valid token (protect) AND an admin role
// (requireAdmin) — layered in that order so an invalid/missing token
// always produces 401 before role is even checked.
router.use(protect, requireAdmin);

router.post("/create", createAdmin);

/**
 * @swagger
 * /admin/players/pending:
 *   get:
 *     tags:
 *       - Admin - Player Review
 *     summary: Get player profiles pending review
 *     description: >
 *       Returns a paginated list of player profiles with profileStatus
 *       "submitted", oldest submissions first, for admin review.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page. Capped at 50.
 *
 *     responses:
 *       200:
 *         description: Pending player profiles retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 profiles:
 *                   - profileId: "68a1f2c3d9f2a5f2b5b7b34"
 *                     player:
 *                       _id: "68912f4c3d9f2a5f2b5b7b12"
 *                       firstName: "Michael"
 *                       lastName: "John"
 *                       email: "player@example.com"
 *                     primaryPosition: "Striker"
 *                     nationality: "Nigerian"
 *                     city: "Ikeja"
 *                     submittedAt: "2026-08-10T09:15:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   total: 4
 *                   totalPages: 1
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
 *         description: Authenticated user is not an admin.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Admin access required."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.get("/players/pending", getPendingPlayerProfiles);

/**
 * @swagger
 * /admin/players/{playerId}/approve:
 *   patch:
 *     tags:
 *       - Admin - Player Review
 *     summary: Approve a player profile
 *     description: >
 *       Approves a player's profile. Only profiles with profileStatus
 *       "submitted" can be approved. Sets reviewedBy and reviewedAt, and
 *       sends the player a "profile_approved" notification.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68912f4c3d9f2a5f2b5b7b12"
 *
 *     responses:
 *       200:
 *         description: Player profile approved.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Player profile approved."
 *               data:
 *                 profile:
 *                   profileStatus: "approved"
 *                   reviewedBy: "68b1f2c3d9f2a5f2b5b7b77"
 *                   reviewedAt: "2026-08-31T09:15:00.000Z"
 *                   rejectionReason: ""
 *
 *       400:
 *         description: Profile is not in "submitted" status, or invalid player ID.
 *         content:
 *           application/json:
 *             examples:
 *               wrongStatus:
 *                 value:
 *                   success: false
 *                   message: "Cannot approve a profile with status \"draft\". Only submitted profiles can be approved."
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: "Invalid player ID."
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
 *         description: Authenticated user is not an admin.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Admin access required."
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
router.patch("/players/:playerId/approve", approvePlayerProfile);

/**
 * @swagger
 * /admin/players/{playerId}/reject:
 *   patch:
 *     tags:
 *       - Admin - Player Review
 *     summary: Reject a player profile
 *     description: >
 *       Rejects a player's profile with a required reason. Only profiles
 *       with profileStatus "submitted" can be rejected. Sets reviewedBy,
 *       reviewedAt, and rejectionReason, and sends the player a
 *       "profile_rejected" notification. The player can edit and
 *       resubmit via PATCH /player/profile afterward.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68912f4c3d9f2a5f2b5b7b12"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             rejectionReason: "Please provide a clearer profile photo and confirm your current club."
 *
 *     responses:
 *       200:
 *         description: Player profile rejected.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Player profile rejected."
 *               data:
 *                 profile:
 *                   profileStatus: "rejected"
 *                   reviewedBy: "68b1f2c3d9f2a5f2b5b7b77"
 *                   reviewedAt: "2026-08-31T09:15:00.000Z"
 *                   rejectionReason: "Please provide a clearer profile photo and confirm your current club."
 *
 *       400:
 *         description: Missing rejectionReason, wrong profile status, or invalid player ID.
 *         content:
 *           application/json:
 *             examples:
 *               missingReason:
 *                 value:
 *                   success: false
 *                   message: "rejectionReason is required."
 *               wrongStatus:
 *                 value:
 *                   success: false
 *                   message: "Cannot reject a profile with status \"approved\". Only submitted profiles can be rejected."
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
 *         description: Authenticated user is not an admin.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Admin access required."
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
router.patch("/players/:playerId/reject", rejectPlayerProfile);

/**
 * @swagger
 * /admin/scouts/pending:
 *   get:
 *     tags:
 *       - Admin - Scout Review
 *     summary: Get scout profiles pending review
 *     description: >
 *       Returns a paginated list of scout profiles with profileStatus
 *       "submitted", oldest submissions first, for admin review. Includes
 *       proofOfAffiliation so the admin can verify it without a second
 *       request.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page. Capped at 50.
 *
 *     responses:
 *       200:
 *         description: Pending scout profiles retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 profiles:
 *                   - profileId: "68a1f2c3d9f2a5f2b5b7b40"
 *                     scout:
 *                       _id: "68a1f2c3d9f2a5f2b5b7b12"
 *                       firstName: "Aruora"
 *                       lastName: "Emmanuel"
 *                       email: "scout@example.com"
 *                     isIndependent: false
 *                     organizationName: "Future Stars Academy"
 *                     title: "Regional Scout"
 *                     proofOfAffiliation:
 *                       url: "https://res.cloudinary.com/demo/image/upload/v1/zscouts/scout-affiliation-proof/badge.jpg"
 *                       publicId: "zscouts/scout-affiliation-proof/badge"
 *                     submittedAt: "2026-08-10T09:15:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   total: 2
 *                   totalPages: 1
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
 *         description: Authenticated user is not an admin.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Admin access required."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.get("/scouts/pending", getPendingScoutProfiles);

/**
 * @swagger
 * /admin/scouts/{scoutId}/approve:
 *   patch:
 *     tags:
 *       - Admin - Scout Review
 *     summary: Approve a scout profile
 *     description: >
 *       Approves a scout's profile. Only profiles with profileStatus
 *       "submitted" can be approved. For org-affiliated scouts
 *       (isIndependent: false), a proof of affiliation must already be
 *       on file — this is re-verified server-side even if the frontend
 *       believes it's present. Sets reviewedBy and reviewedAt, and sends
 *       the scout a "profile_approved" notification.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: scoutId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68a1f2c3d9f2a5f2b5b7b12"
 *
 *     responses:
 *       200:
 *         description: Scout profile approved.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Scout profile approved."
 *               data:
 *                 profile:
 *                   profileStatus: "approved"
 *                   reviewedBy: "68b1f2c3d9f2a5f2b5b7b77"
 *                   reviewedAt: "2026-08-31T09:15:00.000Z"
 *                   rejectionReason: ""
 *
 *       400:
 *         description: Wrong profile status, missing proof of affiliation, or invalid scout ID.
 *         content:
 *           application/json:
 *             examples:
 *               wrongStatus:
 *                 value:
 *                   success: false
 *                   message: "Cannot approve a profile with status \"draft\". Only submitted profiles can be approved."
 *               missingProof:
 *                 value:
 *                   success: false
 *                   message: "Cannot approve — this scout has no proof of affiliation on file."
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
 *         description: Authenticated user is not an admin.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Admin access required."
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
router.patch("/scouts/:scoutId/approve", approveScoutProfile);

/**
 * @swagger
 * /admin/scouts/{scoutId}/reject:
 *   patch:
 *     tags:
 *       - Admin - Scout Review
 *     summary: Reject a scout profile
 *     description: >
 *       Rejects a scout's profile with a required reason. Only profiles
 *       with profileStatus "submitted" can be rejected. Sets reviewedBy,
 *       reviewedAt, and rejectionReason, and sends the scout a
 *       "profile_rejected" notification. The scout can edit and
 *       resubmit via PATCH /scout/profile afterward.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: scoutId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68a1f2c3d9f2a5f2b5b7b12"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             rejectionReason: "The uploaded proof of affiliation is blurry — please re-upload a clearer copy."
 *
 *     responses:
 *       200:
 *         description: Scout profile rejected.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Scout profile rejected."
 *               data:
 *                 profile:
 *                   profileStatus: "rejected"
 *                   reviewedBy: "68b1f2c3d9f2a5f2b5b7b77"
 *                   reviewedAt: "2026-08-31T09:15:00.000Z"
 *                   rejectionReason: "The uploaded proof of affiliation is blurry — please re-upload a clearer copy."
 *
 *       400:
 *         description: Missing rejectionReason, wrong profile status, or invalid scout ID.
 *         content:
 *           application/json:
 *             examples:
 *               missingReason:
 *                 value:
 *                   success: false
 *                   message: "rejectionReason is required."
 *               wrongStatus:
 *                 value:
 *                   success: false
 *                   message: "Cannot reject a profile with status \"approved\". Only submitted profiles can be rejected."
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
 *         description: Authenticated user is not an admin.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Admin access required."
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
router.patch("/scouts/:scoutId/reject", rejectScoutProfile);

export default router;