import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel.js";
import loginLimiter from "../middleware/loginLimiter.js";
import { DUMMY_PASSWORD_HASH } from "../utils/password.js";

const authRouter = express.Router();
authRouter.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" ||
        !validator.isEmail(email.trim()) || password.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    try {
        const user = await userModel.findOne({ email: email.trim() });
        const isMatch = await bcrypt.compare(password, user?.password || DUMMY_PASSWORD_HASH);
        if (!user || !isMatch) {
            return res.status(401).json({ success: false, message: "Email or password is incorrect." });
        }

        const token = jwt.sign({}, process.env.JWT_SECRET, {
            algorithm: "HS256",
            subject: String(user._id),
            issuer: "inkosi-api",
            audience: "inkosi-admin",
            expiresIn: "15m"
        });

        res.set("Cache-Control", "no-store");
        return res.json({ success: true, token, role: user.role, expiresIn: 900 });
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ success: false, message: "Login unavailable" });
    }
});

export default authRouter;
