import mongoose from "mongoose";
import { adminDb } from "../config/adminDb.js";
import "./adminRoleModel.js";

const adminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 100 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "AdminRole", required: true },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 }
});

export default adminDb.model("AdminUser", adminUserSchema);
