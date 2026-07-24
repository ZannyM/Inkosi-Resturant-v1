import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema({
    key: { type: String, default: "primary", unique: true },
    isStoreLive: { type: Boolean, default: true }
}, { timestamps: true });

const storeSettingsModel = mongoose.models.storeSettings || mongoose.model("storeSettings", storeSettingsSchema);

export default storeSettingsModel;
