import { success } from "zod";
import { notificationModel } from "../models/notification/notification.model.js";
import { playerModel } from "../models/player/player.model.js";
import { profileModel } from "../models/player/profile.model.js";
import { videoModel } from "../models/player/video.model.js";
import { scoutProfileModel } from "../models/scout/profile.model.js";
import { scoutModel } from "../models/scout/scout.model.js";

export const getPlayerProfiles = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "submitted" } = req.query;
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50);

        const validStatus = ["draft", "submitted", "approved", "rejected"]

        const filter = {};

        if (status !== "all") {
            if (!validStatus.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status "${status}". Must be one of: "${validStatus.join(", ")},  or "all".`
                })
            }
            filter.profileStatus = status;
        }

        const [profiles, total] = await Promise.all([
            profileModel
                .find(filter)
                .sort({ updatedAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            profileModel.countDocuments(filter)
        ])

        const playerIds = profiles.map((p) => p.user);
        const players = await playerModel
            .find({ _id: { $in: playerIds } })
            .select("firstName lastName email")

        const playerById = new Map(players.map((p) => [p._id.toString(), p]))

        const results = profiles.map((profile) => ({
            profileId: profile._id,
            player: playerById.get(profile.user.toString()) ?? null,
            primaryPosition: profile.primaryPosition,
            nationality: profile.nationality,
            city: profile.city,
            submittedAt: profile.updatedAt
        }))

        return res.status(200).json({
            success: true,
            data: {
                profiles: results,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        })
    } catch (error) {
        console.error("Get Pending Player Profiles Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error occured."
        })
    }
}

export const getPlayerDetailsForAdmin = async (req, res) => {
    try {
        const { playerId } = req.para.$gte
        const profile = await profileModel.findOne({ user: playerId })

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Player not found"
            })
        }

        const player = await playerModel
            .findById(playerId)
            .select("firstName lastName email")

        if (!player) {
            return res.status(400).json({
                success: false,
                message: "Player not found"
            })
        }

        const videos = await videoModel
            .find({ player: playerId, isDeleted: false })
            .select("title description videoUrl thumbnailUrl duration view status createdAt")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            data: {
                player: {
                    _id: player._id,
                    firstName: player.firstName,
                    lastname: player.lastName,
                    email: player.email
                },
                profile: {
                    profileStatus: profile.profileStatus,
                    rejectionReason: profile.rejectionReason,
                    reviewedBy: profile.reviewedBy,
                    reviewAt: profile.reviewedAt,
                    submittedAt: profile.updatedAt,
                    profileImage: profile.profileImage,
                    coverImage: profile.coverImage,
                    bio: profile.bio,
                    primaryPosition: profile.primaryPosition,
                    secondaryPosition: profile.secondaryPosition,
                    preferredFoot: profile.preferredFoot,
                    currentClubOrAcademy: profile.currentClubOrAcademy,
                    height: profile.height,
                    weight: profile.weight,
                    footballBio: profile.footballBio,
                    isAvailableForTrials: profile.isAvailableForTrials,
                    willingToRelocate: profile.willingToRelocate,
                    nationality: profile.nationality,
                    state: profile.state,
                    city: profile.city,
                    socialLinks: profile.socialLinks
                },
                videos
            }
        })
    } catch (error) {
        console.error("Get Player Detail For Admin Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid player ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred"
        });

    }
}

export const approvePlayerProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { playerId } = req.params;

        const profile = await profileModel.findOne({ user: playerId })

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found."
            })
        }

        if (profile.profileStatus !== "submitted") {
            return res.status(400).json({
                success: false,
                messsage: `Cannot approve a profile with status "${profile.profileStatus}". Only submitted profiles can be approved.`
            })
        }

        profile.profileStatus = "approved";
        profile.reviewedBy = adminId;
        profile.reviewedAt = new Date();
        profile.rejectionReason = "";
        await profile.save();

        await notificationModel.create({
            recipient: playerId,
            reciepientModel: "players",
            type: "profile_approved",
            message: "Your profile has been approved.",
            relatedEntityId: profile._id,
        })

        return res.status(200).json({
            success: true,
            message: "Player profile approved.",
            data: { profile },
        })



    } catch (error) {
        console.error("Approve Player Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid player ID."
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred."
        })
    }
}


export const rejectPlayerProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { playerId } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({
                success: false,
                message: "rejectedReason is required."
            })
        }

        const profile = await profileModel.findOne({ user: playerId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            })
        }

        if (profile.profileStatus !== "submitted") {
            return res.status(400).json({
                success: false,
                message: `Cannot reject a profile with status "${profile.profileStatus}". Only submitted profiles can be rejected.`
            })
        }

        profile.profileStatus = "rejected";
        profile.reviewedBy = adminId;
        profile.reviewedAt = new Date();
        profile.rejectionReason = rejectionReason.trim();
        await profile.save()

        await notificationModel.create({
            recipient: playerId,
            reciepientModel: "players",
            type: "profile_rejected",
            message: "Your profile was rejected. Check your profile page for more datails.",
            relatedEntityId: profile._id,
        })

        return res.status(200).json({
            success: true,
            message: "Player profile rejected.",
            data: { profile }
        })


    } catch (error) {
        console.error("Reject Player Profile Error:", error)

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid player ID"
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred"
        })
    }
}


export const getScoutProfiles = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(parseInt(page) || 1, 1)
        const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50)
        const validStatus = ["draft", "submitted", "approved", "rejected"]
        const filter = {};

        if (status !== "all") {
            if (!validStatus.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status "${status}". Must be one of: "${validStatus.join(", ")},  or "all".`
                })
            }
            filter.profileStatus = status;
        }

        const [profiles, total] = await Promise.all([
            scoutProfileModel
                .find(filter)
                .sort({ updatedAt: 1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            scoutProfileModel.countDocuments(filter)
        ])

        const scoutIds = profiles.map((p) => p.user);
        const scouts = await scoutModel
            .find({ _id: { $in: scoutIds } })
            .select("firstName lastName email")

        const scoutById = new Map(scouts.map((s) => [s._id.toString(), s]))

        const results = profiles.map((profile) => ({
            profileId: profile._id,
            scout: scoutById.get(profile.user.toString()) ?? null,
            isIndependent: profile.isIndependent,
            organizationName: profile.organizationName,
            title: profile.title,
            proofOfAffiliation: profile.proofOfAffiliation,
            submittedAt: profile.updatedAt,
        }))

        return res.status(200).json({
            success: true,
            data: {
                profiles: results,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        })


    } catch (error) {
        console.error("Get Pending Scout Profiles Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error occurred."
        })
    }
}

export const getScoutDetailForAdmin = async (req, res) => {
    try {
        const { scoutId } = req.params;

        const profile = await scoutProfileModel.findOne({ user: scoutId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Scout not found"
            });
        }

        const scout = await scoutModel
            .findById(scoutId)
            .select("firstName lastName username email isVerified isActive createdAt");

        if (!scout) {
            return res.status(404).json({
                success: false,
                message: "Scout not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                scout: {
                    _id: scout._id,
                    firstName: scout.firstName,
                    lastName: scout.lastName,
                    username: scout.username,
                    email: scout.email,
                    isVerified: scout.isVerified,
                    isActive: scout.isActive,
                    createdAt: scout.createdAt,
                },
                profile: {
                    profileStatus: profile.profileStatus,
                    rejectionReason: profile.rejectionReason,
                    reviewedBy: profile.reviewedBy,
                    reviewedAt: profile.reviewedAt,
                    submittedAt: profile.updatedAt,
                    profileImage: profile.profileImage,
                    bio: profile.bio,
                    isIndependent: profile.isIndependent,
                    organizationName: profile.organizationName,
                    title: profile.title,
                    yearsOfExperience: profile.yearsOfExperience,
                    nationality: profile.nationality,
                    state: profile.state,
                    city: profile.city,
                    regionsCovered: profile.regionsCovered,
                    phoneNumber: profile.phoneNumber,
                    proofOfAffiliation: profile.proofOfAffiliation,
                    ageGroupsOfInterest: profile.ageGroupsOfInterest,
                    positionsOfInterest: profile.positionsOfInterest,
                    referenceLink: profile.referenceLink,
                    linkedIn: profile.linkedIn,
                    visibility: profile.visibility,
                }
            }
        });

    } catch (error) {
        console.error("Get Scout Detail For Admin Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid scout ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred"
        });
    }
};

export const approveScoutProfile = async (req, res) => {
    try {

        const adminId = req.user.id;
        const { scoutId } = req.params;

        const profile = await scoutProfileModel.findOne({ user: scoutId })

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            })
        }

        if (profile.profileStatus !== "submitted") {
            return res.status(400).json({
                success: false,
                message: `cannot approve a profile with status "${profile.profileStatus}". Only submitted profiles can be approved`
            })
        }

        if (!profile.isIndependent && !profile.proofOfAffiliation?.url) {
            return res.status(400).json({
                success: false,
                message: "Cannot approve - this scout has no proof of affiliation on file."
            })
        }

        profile.profileStatus = "approved";
        profile.reviewedBy = adminId;
        profile.reviewedAt = new Date();
        profile.rejectionReason = "";
        await profile.save();


        await notificationModel.create({
            recipient: scoutId,
            reciepientModel: "scouts",
            type: "profile_approved",
            message: "Your profile has been approved.",
            relatedEntityId: profile._id
        })

        return res.status(200).json({
            success: true,
            message: "Scout profile approved.",
            data: { profile }
        })

    } catch (error) {
        console.error("Approve Scoutg Profile Error:", error)

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid scout ID."
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occured."
        })
    }
}


export const rejectScoutProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { scoutId } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({
                success: false,
                message: "rejectionReason is required."
            })
        }

        const profile = await scoutProfileModel.findOne({ user: scoutId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found."
            })
        }

        if (profile.profileStatus !== "submitted") {
            return res.status(400).json({
                success: false,
                message: `Cannot reject a profile with status "${profile.profileStatus}". Only submitted profile can be rejected.`
            })
        }

        profile.profileStatus = "rejected";
        profile.reviewedBy = adminId;
        profile.reviewedAt = new Date();
        profile.rejectionReason = rejectionReason.trim();
        await profile.save()

        await notificationModel.create({
            recipient: scoutId,
            reciepientModel: "scouts",
            type: "profile_rejected",
            message: "Your profile was rejected. Check your profile page for details.",
            relatedEntityId: profile._id
        })

        return res.status(200).json({
            success: true,
            message: "Scout profile rejected.",
            data: { profile }
        })

    } catch (error) {
        console.error("Reject Scout profile Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid scout ID."
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred."
        })
    }
}

export const getAdminNotifications = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { page = 1, limit = 20, isRead } = req.query;

        const pageNum = Math.max(parseInt(page) || 1, 1)
        const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50);

        const filter = { recipient: adminId, reciepientModel: "admins" };
        if (isRead === "true") {
            filter.isRead = true
        }
        if (isRead === "false") {
            filter.isRead = false
        }

        const [notifications, total, unreadCount] = await Promise.all([
            notificationModel
                .find(filter)
                .sort({ createdAt: -1 })
                .limit(limitNum),
            notificationModel.countDocuments(filter),
            notificationModel.countDocuments({
                recipient: adminId,
                reciepientModel: "admins",
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
        console.error("Get Admin Notification Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error occurred."
        })
    }
}

export const getAdminUnreadCount = async (req, res) => {
    try {
        const adminId = req.user.id;

        const unreadCount = await notificationModel.countDocuments({
            recipient: adminId,
            reciepientModel: "admins",
            isRead: false
        })

        return res.status(200).json({
            success: true,
            data: { unreadCount }
        })
    } catch (error) {
        console.error("Get Admin Notification Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error occurred."
        })
    }
}

export const markNotificationRead = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { notificationId } = req.params;

        const notification = await notificationModel.findOne({
            _id: notificationId,
            recipient: adminId,
            reciepientModel: "admins",
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found.",
            });
        }

        if (!notification.isRead) {
            notification.isRead = true;
            await notification.save();
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read.",
            data: { notification },
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


export const markAllNotificationAsRead = async (req, res) => {
    try {
        const adminId = req.user.id;

        const result = await notificationModel.updateMany(
            { recipient: adminId, reciepientModel: "admins", isRead: false },
            { $set: { isRead: true } }
        )

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read.",
            data: { modifiedCount: result.modifiedCount }
        })

    } catch (error) {
        console.error("Mark All Notifications Read Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error occurred.",
        });
    }
}
export const getDashboardStats = async (req, res) => {
    try {
        const adminId = req.user.id
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - 7)

        const [
            totalPlayers,
            totalScouts,
            pendingPlayerProfiles,
            pendingScoutProfiles,
            approvedPlayerProfiles,
            approvedScoutProfiles,
            rejectedPlayerProfiles,
            rejectedScoutProfiles,
            newPlayersToday,
            newScoutsToday,
            newPlayersThisWeek,
            newScoutsThisWeek,
            unreadNotifications
        ] = await Promise.all([
            playerModel.countDocuments({ role: "player" }),
            scoutModel.countDocuments({ role: "scout" }),
            profileModel.countDocuments({ profileStatus: "submitted" }),
            scoutProfileModel.countDocuments({ profileStatus: "submitted" }),
            profileModel.countDocuments({ profileStatus: "approved" }),
            scoutProfileModel.countDocuments({ profileStatus: "approved" }),
            profileModel.countDocuments({ profileStatus: "rejected" }),
            scoutProfileModel.countDocuments({ profileStatus: "rejected" }),
            playerModel.countDocuments({ role: "player", createdAt: { $gte: startOfToday } }),
            scoutModel.countDocuments({ role: "scout", createdAt: { $gte: startOfToday } }),
            playerModel.countDocuments({ role: "player", createdAt: { $gte: startOfWeek } }),
            scoutModel.countDocuments({ role: "scout", createdAt: { $gte: startOfWeek } }),
            notificationModel.countDocuments({
                recipient: adminId,
                reciepientModel: "admins",
                isRead: false
            })
        ])

        return res.status(200).json({
            success: true,
            data: {
                players: {
                    total: totalPlayers,
                    pendingReview: pendingPlayerProfiles,
                    approved: approvedPlayerProfiles,
                    rejected: rejectedPlayerProfiles,
                    newToday: newPlayersToday,
                    newThisWeek: newPlayersThisWeek
                },
                scouts: {
                    total: totalScouts,
                    pendingReview: pendingScoutProfiles,
                    approved: approvedScoutProfiles,
                    rejected: rejectedScoutProfiles,
                    newToday: newScoutsToday,
                    newThisWeek: newScoutsThisWeek
                },
                pendingReviewTotal: pendingPlayerProfiles + pendingScoutProfiles,
                unreadNotifications
            }
        })
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error occurred."
        })
    }
}