import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificaions,
} from "../controllers/notification.controller.js";

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get the authenticated user's notifications
 *     description: >
 *       Returns a paginated list of notifications for the authenticated
 *       user (player, scout, or admin — scoped automatically by their
 *       role), most recent first, along with a running unread count.
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
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: If "true", only returns unread notifications.
 *
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 notifications:
 *                   - _id: "68b1f2c3d9f2a5f2b5b7b55"
 *                     recipient: "68912f4c3d9f2a5f2b5b7b12"
 *                     recipientModel: "players"
 *                     type: "shortlisted"
 *                     message: "A scout has shortlisted your profile."
 *                     isRead: false
 *                     relatedEntityId: "68a1f2c3d9f2a5f2b5b7b34"
 *                     createdAt: "2026-08-10T09:15:00.000Z"
 *                 unreadCount: 3
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   total: 3
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
 *         description: Account type does not support notifications.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Notifications are not available for this account type."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.get("/", protect, getNotificaions);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark a single notification as read
 *     description: >
 *       Marks one notification as read. Only the notification's own
 *       recipient can mark it — attempting to mark another user's
 *       notification returns a 404, not a 403, so as not to reveal
 *       whether the ID exists.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "68b1f2c3d9f2a5f2b5b7b55"
 *
 *     responses:
 *       200:
 *         description: Notification marked as read.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Notification marked as read."
 *
 *       400:
 *         description: Invalid notification ID format.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid notification ID."
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
 *         description: Notification not found, or does not belong to this user.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Notification not found."
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error occurred."
 */
router.patch("/notifications/:notificationId/read", protect, markNotificationAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read
 *     description: >
 *       Marks every unread notification belonging to the authenticated
 *       user as read, in a single bulk update.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: All notifications marked as read.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "All notifications marked as read."
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
router.patch("/notifications/read-all", protect, markAllNotificationsAsRead);

export default router;