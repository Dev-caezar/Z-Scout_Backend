import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema(
    {
        scout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "scouts",
            required: true
        },

        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "players",
            required: true
        },
        note:{
            type: String,
            trim: true,
            maxLength: 300,
            defaault: ""
        }
    },
    {
        timestamps: true
    }
)

shortlistSchema.index({scout: 1, player: 1}, {unique: true})

export const shortlistModel = mongoose.model("shortlists", shortlistSchema)