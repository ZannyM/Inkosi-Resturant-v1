import express from 'express'
import { addToCart, removeFromCart, clearCartItem, getCart, mergeCart, moveCartItem, removeSavedItem } from '../controllers/cartController.js'
import authMiddleware from '../middleware/auth.js'

const cartRouter = express.Router();

//api endpoints
cartRouter.post("/add",authMiddleware,addToCart);
cartRouter.post("/remove",authMiddleware,removeFromCart);
cartRouter.post("/clear",authMiddleware,clearCartItem);
cartRouter.get("/get",authMiddleware,getCart);
cartRouter.post("/get",authMiddleware,getCart);
cartRouter.post("/merge",authMiddleware,mergeCart);
cartRouter.post("/move",authMiddleware,moveCartItem);
cartRouter.post("/saved/remove",authMiddleware,removeSavedItem);

export default cartRouter;