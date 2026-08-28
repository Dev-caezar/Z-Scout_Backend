import { ROLE_TO_RECIPIENT_MODEL } from "../constants.js"
import { notificationModel } from "../models/player/notification.model.js";

export const getNotificaions = async (req, res) =>{
    try {
        const userId = req.user.id
        const reciepientModel = ROLE_TO_RECIPIENT_MODEL[req.user.role];

        if (!reciepientModel) {
            return res.status(403).json({
                success: false,
                message: "Notifications are not available for this account type."
            })
        }

        const {page = 1, limit = 20, unreadOnly} = req.query;
        const pageNum = Math.max(parseInt(page) || 1,1);
        const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50)

        const filter = {recipient: userId, reciepientModel};
        if (unreadOnly === "true") {
            filter.isRead = false
        }

        const [notifications,total, unreadCount] = await Promise.all([
            notificationModel
            .find(filter)
            .sort({createdAt: -1})
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
            notificationModel.countDocuments(filter),
            notificationModel.countDocuments({
                recipient: userId,
                reciepientModel,
                isRead: false
            })
        ])

        return res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        })

    } catch (error) {
        console.error("Get Notifications Error:", error)

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred"
        })
    }
}

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;
 
    const notification = await notificationModel.findOne({
      _id: notificationId,
      recipient: userId, // ownership check — can't mark someone else's as read
    });
 
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }
 
    notification.isRead = true;
    await notification.save();
 
    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
 
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }
 
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred.",
    });
  }
};
 
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipientModel = ROLE_TO_RECIPIENT_MODEL[req.user.role];
 
    await notificationModel.updateMany(
      { recipient: userId, recipientModel, isRead: false },
      { $set: { isRead: true } },
    );
 
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
 
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred.",
    });
  }
};