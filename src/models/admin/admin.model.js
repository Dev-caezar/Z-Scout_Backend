import mongoose from "mongoose";
import { lowercase, minLength } from "zod";

const adminSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            minLength: 8,
        },

        role: {
            type: String,
            enum: ["admin"],
            default: "admin",
        },

        isVerified: {
            type: Boolean,
            default: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admins",
            default: null
        },

        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

export const adminModel = mongoose.model("admins", adminSchema)