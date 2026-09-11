import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/requireAdmin.middleware.js";
import {
    approvePlayerProfile,
    rejectPlayerProfile,
    approveScoutProfile,
    rejectScoutProfile,
    getAdminNotifications,
    getAdminUnreadCount,
    markAllNotificationAsRead,
    markNotificationRead,
    getDashboardStats,
    getPlayerProfiles,
    getScoutProfiles,
} from "../controllers/adminReview.controller.js";
import { createAdmin } from "../controllers/auth.controller.js";

const router = Router();

// Every route here requires BOTH a valid token (protect) AND an admin role
// (requireAdmin) — layered in that order so an invalid/missing token
// always produces 401 before role is even checked.
router.post("/create", createAdmin);
router.use(protect, requireAdmin);


/**
 * @swagger
 * /admin/players:
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
router.get("/players", getPlayerProfiles);

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
 * /admin/scouts:
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
router.get("/scouts", getScoutProfiles);

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

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "66fa1c2e8b1e4a0012a3f9d1"
 *         recipient:
 *           type: string
 *           description: ObjectId of the recipient (player, scout, or admin)
 *           example: "66fa1c2e8b1e4a0012a3f9c0"
 *         reciepientModel:
 *           type: string
 *           enum: [players, scouts, admins]
 *           example: admins
 *         type:
 *           type: string
 *           enum:
 *             - shortlisted
 *             - profile_approved
 *             - profile_rejected
 *             - profile_submitted
 *             - video_approved
 *             - video_rejected
 *             - video_commented
 *           example: profile_submitted
 *         message:
 *           type: string
 *           maxLength: 300
 *           example: "John Doe submitted a player profile for review."
 *         isRead:
 *           type: boolean
 *           default: false
 *         relatedEntityId:
 *           type: string
 *           description: ObjectId of the related profile/video/entity
 *           example: "66fa1c2e8b1e4a0012a3f9e2"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 42
 *         totalPages:
 *           type: integer
 *           example: 3
 *
 *   parameters:
 *     notificationIdParam:
 *       in: path
 *       name: notificationId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of the notification
 */

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     summary: Get paginated notifications for the logged-in admin
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Results per page (capped at 50)
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by read status. Omit to return both.
 *     responses:
 *       200:
 *         description: List of notifications for the current admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/notifications", getAdminNotifications)

/**
 * @swagger
 * /admin/notifications/unread-count:
 *   get:
 *     summary: Get the unread notification count for the logged-in admin
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/notifications/unread-count", getAdminUnreadCount)

/**
 * @swagger
 * /admin/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/notificationIdParam'
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification marked as read.
 *                 data:
 *                   type: object
 *                   properties:
 *                     notification:
 *                       $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid notification ID
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Notification not found (or does not belong to this admin)
 *       500:
 *         description: Internal server error
 */
router.patch("/notifications/:notificationId/read", markNotificationRead)

/**
 * @swagger
 * /admin/notifications/read-all:
 *   patch:
 *     summary: Mark all of the logged-in admin's unread notifications as read
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All unread notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read.
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.patch("/notifications/read-all", markAllNotificationAsRead)

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get aggregate stats for the admin dashboard
 *     description: >
 *       Returns player and scout counts (total, pending review, approved,
 *       rejected, new today, new this week — rolling 7 days), a combined
 *       pending-review total, and the logged-in admin's unread
 *       notification count.
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     players:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 128
 *                         pendingReview:
 *                           type: integer
 *                           example: 6
 *                         approved:
 *                           type: integer
 *                           example: 110
 *                         rejected:
 *                           type: integer
 *                           example: 12
 *                         newToday:
 *                           type: integer
 *                           example: 3
 *                         newThisWeek:
 *                           type: integer
 *                           example: 14
 *                     scouts:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 34
 *                         pendingReview:
 *                           type: integer
 *                           example: 2
 *                         approved:
 *                           type: integer
 *                           example: 29
 *                         rejected:
 *                           type: integer
 *                           example: 3
 *                         newToday:
 *                           type: integer
 *                           example: 1
 *                         newThisWeek:
 *                           type: integer
 *                           example: 5
 *                     pendingReviewTotal:
 *                       type: integer
 *                       example: 8
 *                     unreadNotifications:
 *                       type: integer
 *                       example: 5
 *             example:
 *               success: true
 *               data:
 *                 players:
 *                   total: 128
 *                   pendingReview: 6
 *                   approved: 110
 *                   rejected: 12
 *                   newToday: 3
 *                   newThisWeek: 14
 *                 scouts:
 *                   total: 34
 *                   pendingReview: 2
 *                   approved: 29
 *                   rejected: 3
 *                   newToday: 1
 *                   newThisWeek: 5
 *                 pendingReviewTotal: 8
 *                 unreadNotifications: 5
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized."
 *       403:
 *         description: Authenticated user is not an admin.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Admin access required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.get("/dashboard/stats", getDashboardStats);

export default router;