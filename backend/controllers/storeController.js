import storeSettingsModel from "../models/storeSettingsModel.js";
import { OPERATING_HOURS_LABEL, isWithinOperatingHours } from "../utils/storeHours.js";

const getStoreStatus = async (req, res) => {
    try {
        const settings = await storeSettingsModel.findOneAndUpdate(
            { key: "primary" },
            { $setOnInsert: { isStoreLive: true } },
            { upsert: true, new: true }
        );

        const withinOperatingHours = isWithinOperatingHours();
        const isAcceptingOrders = settings.isStoreLive && withinOperatingHours;
        let closedReason = null;

        if (!settings.isStoreLive) {
            closedReason = "KITCHEN_PAUSED";
        } else if (!withinOperatingHours) {
            closedReason = "OUTSIDE_OPERATING_HOURS";
        }

        res.json({
            success: true,
            data: {
                isStoreLive: settings.isStoreLive,
                isWithinOperatingHours: withinOperatingHours,
                isAcceptingOrders,
                closedReason,
                operatingHours: OPERATING_HOURS_LABEL
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching store status" });
    }
};

const updateStoreStatus = async (req, res) => {
    try {
        const { isStoreLive } = req.body;

        if (typeof isStoreLive !== "boolean") {
            return res.json({ success: false, message: "isStoreLive must be a boolean" });
        }

        const settings = await storeSettingsModel.findOneAndUpdate(
            { key: "primary" },
            { isStoreLive },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: isStoreLive ? "Store is now live" : "Store is now paused",
            data: { isStoreLive: settings.isStoreLive }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating store status" });
    }
};

export { getStoreStatus, updateStoreStatus };
