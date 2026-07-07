import express from 'express'
import { addToCart, removeFromCart, getCart } from '../controllers/cartController.js'
import authMiddleware from '../middleware/auth.js'

const cartRouter = express.Router();

//api endpoints
cartRouter.post("/add",authMiddleware,addToCart);
cartRouter.post("/remove",authMiddleware,removeFromCart);
cartRouter.get("/get",authMiddleware,getCart);
cartRouter.post("/get",authMiddleware,getCart);

export default cartRouter;