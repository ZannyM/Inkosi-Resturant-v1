import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import validator from "validator";
import adminUserModel from "../models/adminUserModel.js";
import adminRoleModel from "../models/adminRoleModel.js";
import verifyAdmin, { requirePermission } from "../middleware/verifyAdmin.js";
import { validAdminPassword } from "../utils/password.js";

const staffRouter = express.Router();

staffRouter.use(verifyAdmin, requirePermission("staff:manage"));

staffRouter.get("/roles", async (req, res) => {
    try {
        const roles = await adminRoleModel.find().select("name permissions").sort("name");
        return res.json({ success: true, roles });
    } catch (error) {
        console.error("Could not list admin roles:", error);
        return res.status(500).json({ success: false, message: "Could not list roles" });
    }
});

staffRouter.get("/", async (req, res) => {
    try {
        const users = await adminUserModel.find().select("username email role isActive").populate("role", "name").sort("username");
        return res.json({ success: true, users });
    } catch (error) {
        console.error("Could not list staff:", error);
        return res.status(500).json({ success: false, message: "Could not list staff" });
    }
});

staffRouter.post("/", async (req, res) => {
    const { username, email, password, roleId } = req.body || {};
    if (typeof username !== "string" || !username.trim() || username.trim().length > 50 ||
        typeof email !== "string" || email.trim().length > 100 || !validator.isEmail(email.trim()) ||
        !validAdminPassword(password) || typeof roleId !== "string" || !mongoose.isValidObjectId(roleId)) {
        return res.status(400).json({ success: false, message: "Enter a valid username, email, role and password (12-72 UTF-8 bytes)" });
    }
    try {
        const role = await adminRoleModel.findById(roleId);
        if (!role) return res.status(400).json({ success: false, message: "Role not found" });
        const user = await adminUserModel.create({
            username: username.trim(), email: email.trim().toLowerCase(),
            passwordHash: await bcrypt.hash(password, 10), role: role._id
        });
        return res.status(201).json({ success: true, user: {
            id: user.id, username: user.username, email: user.email,
            role: { _id: role.id, name: role.name }, isActive: user.isActive
        } });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ success: false, message: "Username or email already exists" });
        console.error("Could not create staff account:", error);
        return res.status(500).json({ success: false, message: "Could not create staff account" });
    }
});

staffRouter.patch("/:id/status", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id) || typeof req.body?.isActive !== "boolean") {
        return res.status(400).json({ success: false, message: "Invalid account or status" });
    }
    if (new mongoose.Types.ObjectId(id).toString() === req.admin.id && !req.body.isActive) {
        return res.status(400).json({ success: false, message: "You cannot deactivate your own account" });
    }
    try {
        const user = await adminUserModel.findByIdAndUpdate(id,
            { $set: { isActive: req.body.isActive }, $inc: { tokenVersion: 1 } }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: "Account not found" });
        return res.json({ success: true, isActive: user.isActive });
    } catch (error) {
        console.error("Could not update staff status:", error);
        return res.status(500).json({ success: false, message: "Could not update staff status" });
    }
});

export default staffRouter;
