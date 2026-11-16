import mongoose from "mongoose";
import { adminDb } from "../config/adminDb.js";

const adminRoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: { type: [String], required: true }
});

export default adminDb.model("AdminRole", adminRoleSchema);
