import express from "express";
import { getStoreStatus, updateStoreStatus } from "../controllers/storeController.js";
import verifyAdmin, { requirePermission } from "../middleware/verifyAdmin.js";

const storeRouter = express.Router();

storeRouter.get("/status", getStoreStatus);
storeRouter.post("/status", verifyAdmin, requirePermission("store:write"), updateStoreStatus);

export default storeRouter;
