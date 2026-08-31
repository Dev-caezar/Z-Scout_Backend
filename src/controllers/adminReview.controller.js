import { notificationModel } from "../models/player/notification.model.js";
import { playerModel } from "../models/player/player.model.js";
import { profileModel } from "../models/player/profile.model.js";
import { scoutProfileModel } from "../models/scout/profile.model.js";
import { scoutModel } from "../models/scout/scout.model.js";

export const getPendingPlayerProfiles = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(Math.max(parseInt(limit) || 20, 1), 50);

        const filter = { profileStatus: "submitted" };

        const [profiles, total] = await Promise.all([
            profileModel
                .find(filter)
                .sort({ updatedAt: 1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            profileModel.countDocuments(filter)
        ])

        const playerIds = profiles.map((p) => p.user);
        const players = await playerModel
            .find({ _id: { $in: playerIds } })
            .select("firstName, lastName, email")

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
                success: fslse,
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
                message: `Cannot approve a profile with status "${profile.profileStatus}". Only submitted profiles can be approved.`
            })
        }

        profile.profileStatus = "rejected";
        profile.reviewedBy = adminId;
        profile.reviewedAt = new Date();
        profile.rejectionReason = rejectionReason.trim();
        await profile.save

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


export const getPendingScoutProfiles = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(parseInt(page) || 1, 1)
        const limitNum = Math.max(Math.max(parseInt(limit) || 20, 1), 50)

        const filter = { profileStatus: "submitted" };

        const [profiles, total] = await Promise.all([
            scoutProfileModel
                .find(filter)
                .sort({ updatedAt: 1 })
                .skip((pageNum = 1) * limitNum)
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
            message: "Your profile was rejected\. Check your profile page for details."
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