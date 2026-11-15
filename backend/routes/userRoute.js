import express from "express"
import authMiddleware from '../middleware/auth.js'
import { loginUser, registerUser, getUserProfile } from "../controllers/userController.js"
import loginLimiter from "../middleware/loginLimiter.js"

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginLimiter, loginUser)
userRouter.get("/profile", authMiddleware, getUserProfile)

export default userRouter;