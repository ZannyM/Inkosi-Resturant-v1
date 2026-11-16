import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import adminUserModel from "../models/adminUserModel.js";
import loginLimiter from "../middleware/loginLimiter.js";
import { DUMMY_PASSWORD_HASH, validAdminPassword } from "../utils/password.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const authRouter = express.Router();
authRouter.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" ||
        !validator.isEmail(email.trim()) || password.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    try {
        const user = await adminUserModel.findOne({ email: email.trim().toLowerCase() })
            .select("+passwordHash").populate("role");
        const isMatch = await bcrypt.compare(password, user?.passwordHash || DUMMY_PASSWORD_HASH);
        if (!user || !isMatch || !validAdminPassword(password) || !user.isActive || !user.role) {
            return res.status(401).json({ success: false, message: "Email or password is incorrect." });
        }

        const token = jwt.sign({ version: user.tokenVersion }, process.env.ADMIN_JWT_SECRET, {
            algorithm: "HS256",
            subject: String(user._id),
            issuer: "inkosi-api",
            audience: "inkosi-admin",
            expiresIn: "15m"
        });

        res.set("Cache-Control", "no-store");
        return res.json({
            success: true, token, role: user.role.name,
            permissions: user.role.permissions, mustChangePassword: user.mustChangePassword,
            expiresIn: 900
        });
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ success: false, message: "Login unavailable" });
    }
});

authRouter.post("/password", verifyAdmin, async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!validAdminPassword(currentPassword) || !validAdminPassword(newPassword) || currentPassword === newPassword) {
        return res.status(400).json({ success: false, message: "Enter a different password of 12-72 UTF-8 bytes" });
    }
    try {
        const user = await adminUserModel.findById(req.admin.id).select("+passwordHash");
        if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }
        const result = await adminUserModel.updateOne(
            { _id: req.admin.id, isActive: true, tokenVersion: req.admin.version },
            { $set: { passwordHash: await bcrypt.hash(newPassword, 10), mustChangePassword: false },
                $inc: { tokenVersion: 1 } }
        );
        if (result.modifiedCount !== 1) {
            return res.status(401).json({ success: false, message: "Account or session is no longer active" });
        }
        return res.json({ success: true, message: "Password changed. Sign in again." });
    } catch (error) {
        console.error("Could not change admin password:", error);
        return res.status(500).json({ success: false, message: "Could not change password" });
    }
});

export default authRouter;
