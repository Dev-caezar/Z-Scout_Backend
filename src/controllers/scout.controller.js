import { SCOUT_ALLOWED_FIELDS, SCOUT_REQUIRED_FIELDS, SENSITIVE_FIELDS, escapeRegex, AGE_GROUP_RANGES } from "../constants.js";
import { profileModel } from "../models/player/profile.model.js";
import { scoutProfileModel } from "../models/scout/profile.model.js";
import { scoutModel } from "../models/scout/scout.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudnary.js";

export const completeScoutProfile = async (req, res) => {
    try {
        const scoutId = req.user.id;

        const scout = await scoutModel.findOne({ _id: scoutId, role: "scout" });

        if (!scout) {
            return res.status(404).json({
                success: false,
                message: "Scout not found.",
            });
        }

        let scoutProfile = await scoutProfileModel.findOne({ user: scoutId });

        if (scoutProfile?.profileStatus === "approved") {
            return res.status(400).json({
                success: false,
                message: "Your profile has already been approved.",
            });
        }

        const unknownFields = Object.keys(req.body).filter(
            (field) => !SCOUT_ALLOWED_FIELDS.includes(field),
        );

        if (unknownFields.length) {
            return res.status(400).json({
                success: false,
                message: `Unknown field(s): ${unknownFields.join(", ")}`,
            });
        }

        const isIndependent = req.body.isIndependent === true;
        const requiredFields = [...SCOUT_REQUIRED_FIELDS];

        if (!isIndependent) {
            requiredFields.push("organizationName");
        }

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

        if (
            req.body.regionsCovered !== undefined &&
            !Array.isArray(req.body.regionsCovered)
        ) {
            return res.status(400).json({
                success: false,
                message: "regionsCovered must be an array of strings.",
            });
        }

        if (!scoutProfile) {
            scoutProfile = new scoutProfileModel({ user: scoutId });
        }

        scoutProfile.isIndependent = isIndependent;
        if (isIndependent) {
            scoutProfile.organizationName = "";
        }

        SCOUT_ALLOWED_FIELDS.forEach((field) => {
            if (field === "isIndependent") return;
            if (req.body[field] === undefined) return;
            scoutProfile[field] = req.body[field];
        });

        if (
            !isIndependent &&
            (!scoutProfile.proofOfAffiliation || !scoutProfile.proofOfAffiliation.url)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Proof of affiliation is required for scouts representing an organization. Please upload it before submitting.",
            });
        }

        scoutProfile.profileStatus = "submitted";
        scoutProfile.reviewedBy = undefined;
        scoutProfile.reviewedAt = undefined;
        scoutProfile.rejectionReason = "";
        scout.profileCompleted = true;

        await Promise.all([scout.save(), scoutProfile.save()]);

        return res.status(200).json({
            success: true,
            message: "Profile submitted successfully and is awaiting review.",
            data: {
                scout,
                profile: scoutProfile,
            },
        });
    } catch (error) {
        console.error("Complete Scout Profile Error:", error);

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

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Profile already exists for this scout.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred.",
        });
    }
};

export const uploadProofOfAffiliation = async (req, res) => {
    try {
        const scoutId = req.user.id;

        let scoutProfile = await scoutProfileModel.findOne({ user: scoutId });

        if (!scoutProfile) {
            scoutProfile = new scoutProfileModel({
                user: scoutId,
            });
        }

        if (scoutProfile.profileStatus === "approved") {
            return res.status(400).json({
                success: false,
                message: "Your profile has already been approved.",
            });
        }

        if (scoutProfile.isIndependent) {
            return res.status(400).json({
                success: false,
                message:
                    "Proof of affiliation only applies to scouts representing an organization.",
            });
        }

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file (image or PDF).",
            });
        }

        // Clean up the previous file in Cloudinary before uploading the new one
        if (scoutProfile.proofOfAffiliation?.publicId) {
            await cloudinaryDestroy(scoutProfile.proofOfAffiliation.publicId);
        }

        // "auto" lets Cloudinary correctly store either an image or a raw PDF
        const uploaded = await uploadToCloudinary(
            file.buffer,
            "zscouts/scout-affiliation-proof",
            "auto",
        );

        scoutProfile.proofOfAffiliation = {
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
        };

        await scoutProfile.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: "Proof of affiliation uploaded successfully.",
            data: {
                proofOfAffiliation: scoutProfile.proofOfAffiliation,
            },
        });
    } catch (error) {
        console.error("Upload Proof Of Affiliation Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)
                    .map((err) => err.message)
                    .join(", "),
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred.",
        });
    }
};

async function cloudinaryDestroy(publicId) {
    try {
        const cloudinary = (await import("../config/cloudinary.js")).default;
        await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
    } catch (err) {
        console.error("Failed to destroy old proofOfAffiliation asset:", err);
    }
}

export const getScoutProfile = async (req, res) => {
    try {
        const scoutId = req.user.id;

        const scout = await scoutModel
            .findOne({ _id: scoutId, role: "scout" })
            .select(SENSITIVE_FIELDS);

        if (!scout) {
            return res.status(404).json({
                success: false,
                message: "Scout not found.",
            });
        }

        const scoutProfile = await scoutProfileModel.findOne({ user: scoutId });

        return res.status(200).json({
            success: true,
            data: {
                scout,
                profile: scoutProfile,
            },
        });
    } catch (error) {
        console.error("Get Scout Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred.",
        });
    }
};

export const updateScoutingInterest = async (req, res) => {
    try {
        const scoutId = req.user.id;

        const scoutProfile = await scoutProfileModel.findOne({ user: scoutId })
        if (!scoutProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found. Complete your profile first"
            })
        }

        const { ageGroupsOfInterest, positionsOfInterest } = req.body

        const unknownFields = Object.keys(req.body).filter((field) => !["ageGroupsOfInterest", "positionsOfInterest"].includes(field))

        if (unknownFields.length) {
            return res.status(400).json({
                success: false,
                message: `Unknown field(s): ${unknownFields.join(", ")}`,
            });
        }

        if (ageGroupsOfInterest !== undefined && !Array.isArray(ageGroupsOfInterest) || positionsOfInterest !== undefined && !Array.isArray(positionsOfInterest)) {
            return res.status(400).json({
                success: false,
                message: "ageGroupsOfInterest and positionsOfInterest must be an array of strings"
            })
        }

        if (ageGroupsOfInterest !== undefined) {
            scoutProfile.ageGroupsOfInterest = ageGroupsOfInterest
        }

        if (positionsOfInterest !== undefined) {
            scoutProfile.positionsOfInterest = positionsOfInterest
        }

        await scoutProfile.save()

        return res.status(200).json({
            success: true,
            message: "Scouting interests updated sucessfully",
            data: {
                ageGroupsOfInterest: scoutProfile.ageGroupsOfInterest,
                positionsOfInterest: scoutProfile.positionsOfInterest
            }
        })


    } catch (error) {
        console.log("update scouting interests error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map((err) => err.message).join(", ")

            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error occurred"
        })
    }
}

export const browsePlayers = async (req, res) => {
    try {
        const { search, positions, ageGroups, nationality, availableForTrialsOnly, page = 1, limit = 12 } = req.query;

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit) || 12, 1), 50);

        const matchStage = {
            profileStatus: "approved",
            visibility: "public"
        }

        if (positions) {
            const positionList = positions.split(",").map((p) => p.trim()).filter(Boolean)

            if (positionList.length > 0) {
                matchStage.$or = [
                    { primaryPosition: { $in: positionList } },
                    { secondaryPosition: { $in: positionList } }
                ]
            }
        }

        if (nationality) {
            matchStage.nationality = {
                $regex: escapeRegex(nationality.trim()),
                $options: "i"
            }
        }

        if (availableForTrialsOnly === "true") {
            matchStage.isAvailableForTrials = true
        }

        const pipeline = [
            { $match: matchStage },

            {
                $addFields: {
                    age: {
                        $dateDiff: {
                            startDate: "$dateOfBirth",
                            endDate: "$$NOW",
                            unit: "year"
                        }
                    }
                }
            }
        ]

        if (ageGroups) {
            const ageGroupList = ageGroups.split(",").map((a) => a.trim()).filter((a) => AGE_GROUP_RANGES[a])

            if (ageGroupList.length > 0) {
                const ageConditions = ageGroupList.map((group) => {
                    const { min, max } = AGE_GROUP_RANGES[group]
                    return { age: { $gte: min, $lte: max } }
                })
                pipeline.push({ $match: { $or: ageConditions } })
            }
        }

        pipeline.push(
            {
                $lookup: {
                    from: "players",
                    localField: "user",
                    foreignField: "_id",
                    as: "player"
                }
            },
            {$unwind: "$player"}
        )

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        {"player.firstName": {$regex: escapeRegex(search.trim()), $options: "i"}},
                        {"player.lastName": {$regex: escapeRegex(search.trim()), $options: "i"}}
                    ]
                }
            })
        }

        pipeline.push({
            $project: {
                _id: 1,
                firstName: "$player.firstName",
                lastName: "$player.lastName",
                profileImage: 1,
                primaryPosition: 1,
                secondaryPosition: 1,
                age: 1,
                nationality: 1,
                state: 1,
                city: 1,
                currentClubOrAcademy: 1,
                isAvailableForTrials: 1,
                willingToRelocate: 1
            }
        })

        pipeline.push({
            $facet: {
                results: [
                    {$skip: (pageNum - 1) * limitNum},
                    {$limit: limitNum}
                ],
                totalCount: [{$count: "count"}]
            }
        })

        const [aggResult] = await profileModel.aggregate(pipeline);
        const results = aggResult?.results ?? [];
        const total = aggResult?.totalCount?.[0]?.count ?? 0;

        return res.status(200).json({
            success: true,
            data: {
                players: results,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        })


    } catch (error) {
        console.error("Browse Players Error:", error)

        return res.status(500).json({
            success: false,
            message: "Internal server error occured."
        })
    }
}