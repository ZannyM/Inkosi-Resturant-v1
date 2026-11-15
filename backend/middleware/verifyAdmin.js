import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";

const verifyAdmin = async (req, res, next) => {
    const match = /^Bearer\s+(\S+)$/i.exec(req.get("Authorization") || "");
    if (!match) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let payload;
    try {
        payload = jwt.verify(match[1], process.env.JWT_SECRET, {
            algorithms: ["HS256"],
            issuer: "inkosi-api",
            audience: "inkosi-admin",
            maxAge: "15m"
        });
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    if (typeof payload !== "object" || !Number.isInteger(payload.exp) ||
        typeof payload.sub !== "string" || !mongoose.isValidObjectId(payload.sub)) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

    try {
        const user = await userModel.findById(payload.sub).select("role");
        if (!user) {
            return res.status(401).json({ success: false, message: "User no longer exists" });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }
        req.admin = { id: String(user._id), role: user.role };
        return next();
    } catch (error) {
        console.error("Admin authentication failed:", error);
        return res.status(500).json({ success: false, message: "Authentication unavailable" });
    }
};

export default verifyAdmin;
