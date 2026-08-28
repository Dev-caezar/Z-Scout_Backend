import mongoose from "mongoose";
import { required } from "zod/mini";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "reciepientModel",
        },
        reciepientModel: {
            type: String,
            required: true,
            enum: ["players", "scouts", "admins"]
        },
        type: {
            type: String,
            required: true,
            enum: [
                "shortlisted",
                "profile_approved",
                "profile_rejected",
                "video_approved",
                "video_rejected",
                "video_commented",
            ]
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300
        },
        isRead: {
            type: Boolean,
            default: false
        },
        relatedEntityId: {
            type: mongoose.Schema.Types.ObjectId,
        }
    },
    {
        timestamps: true
    }
)

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const notificationModel = mongoose.model("notifications", notificationSchema)