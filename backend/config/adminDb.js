import mongoose from "mongoose";

export const adminDb = mongoose.createConnection();

export async function connectAdminDB() {
    if (!process.env.ADMIN_MONGO_URI) {
        throw new Error("ADMIN_MONGO_URI must be configured");
    }
    await adminDb.openUri(process.env.ADMIN_MONGO_URI);
}
