import storeSettingsModel from "../models/storeSettingsModel.js";

const getStoreStatus = async (req, res) => {
    try {
        const settings = await storeSettingsModel.findOneAndUpdate(
            { key: "primary" },
            { $setOnInsert: { isStoreLive: true } },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: { isStoreLive: settings.isStoreLive } });
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
