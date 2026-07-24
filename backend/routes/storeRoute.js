import express from "express";
import { getStoreStatus, updateStoreStatus } from "../controllers/storeController.js";

const storeRouter = express.Router();

storeRouter.get("/status", getStoreStatus);
storeRouter.post("/status", updateStoreStatus);

export default storeRouter;
