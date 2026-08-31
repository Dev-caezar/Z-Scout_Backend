import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import { hashPassword } from "../utils/hashPassword.js";
import { adminModel } from "../models/admin/admin.model.js";

// fileURLToPath correctly handles Windows drive letters (C:\...) —
// new URL(...).pathname does NOT, and produces a broken path on Windows
// (a stray leading slash before the drive letter breaks resolution).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@zscouts.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

const seedAdmin = async () => {
    if (!ADMIN_PASSWORD) {
        console.error("SEED_ADMIN_PASSWORD is not set. Add it to your .env before running this script.");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await adminModel.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        console.log(`Admin already exists for ${ADMIN_EMAIL}. Nothing to do.`);
        await mongoose.disconnect();
        return;
    }

    const hashed = await hashPassword(ADMIN_PASSWORD);

    await adminModel.create({
        firstName: "Admin",
        lastName: "Caezar",
        email: ADMIN_EMAIL,
        password: hashed,
    });

    console.log(`Admin account created for ${ADMIN_EMAIL}.`);
    console.log("Log in via your normal /login endpoint with this email and the password you set in SEED_ADMIN_PASSWORD.");

    await mongoose.disconnect();
};

// Called ONCE, at the top level — outside and after the function
// definition, not nested inside it.
seedAdmin().catch((err) => {
    console.error("Failed to seed admin:", err);
    process.exit(1);
});