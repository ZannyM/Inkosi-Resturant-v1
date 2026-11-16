import express from "express"
import authMiddleware from "../middleware/auth.js"
import verifyAdmin, { requirePermission } from "../middleware/verifyAdmin.js"
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder } from "../controllers/orderController.js"

const orderRouter = express.Router();

//api endpoint to place order
orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder)
orderRouter.post("/userorders",authMiddleware,userOrders)
orderRouter.get("/list",verifyAdmin,requirePermission("orders:read"),listOrders)
orderRouter.post("/status",verifyAdmin,requirePermission("orders:write"),updateStatus)


export default orderRouter;