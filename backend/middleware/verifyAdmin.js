import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import adminUserModel from "../models/adminUserModel.js";

export const verifyAdmin = async (req, res, next) => {
    const match = /^Bearer\s+(\S+)$/i.exec(req.get("Authorization") || "");
    if (!match) return res.status(401).json({ success: false, message: "Authentication required" });

    let payload;
    try {
        payload = jwt.verify(match[1], process.env.ADMIN_JWT_SECRET, {
            algorithms: ["HS256"], issuer: "inkosi-api", audience: "inkosi-admin", maxAge: "15m"
        });
    } catch {
        try {
            const customer = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ["HS256"] });
            if (typeof customer === "object" && typeof customer.id === "string" && !customer.aud) {
                return res.status(403).json({ success: false, message: "Admin access required" });
            }
        } catch {
            // An invalid token is not an authenticated customer token.
        }
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    if (typeof payload !== "object" || !Number.isInteger(payload.exp) ||
        typeof payload.sub !== "string" || !mongoose.isValidObjectId(payload.sub) ||
        !Number.isInteger(payload.version)) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

    try {
        const user = await adminUserModel.findById(payload.sub).populate("role");
        if (!user || !user.isActive || user.tokenVersion !== payload.version) {
            return res.status(401).json({ success: false, message: "Account or session is no longer active" });
        }
        if (!user.role) return res.status(403).json({ success: false, message: "Admin role unavailable" });
        req.admin = { id: String(user._id), version: payload.version, role: user.role.name, permissions: user.role.permissions,
            mustChangePassword: user.mustChangePassword };
        return next();
    } catch (error) {
        console.error("Admin authentication failed:", error);
        return res.status(500).json({ success: false, message: "Authentication unavailable" });
    }
};

export const requirePermission = (permission) => (req, res, next) => {
    if (req.admin.mustChangePassword) {
        return res.status(403).json({ success: false, message: "Password change required" });
    }
    if (!req.admin.permissions.includes(permission)) {
        return res.status(403).json({ success: false, message: "Permission denied" });
    }
    return next();
};

export default verifyAdmin;
