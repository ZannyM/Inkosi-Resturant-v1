import express from "express";
import { getStoreStatus, updateStoreStatus } from "../controllers/storeController.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const storeRouter = express.Router();

storeRouter.get("/status", getStoreStatus);
storeRouter.post("/status", verifyAdmin, updateStoreStatus);

export default storeRouter;
