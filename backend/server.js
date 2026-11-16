import "dotenv/config"
import express from "express"
import cors from "cors"
import fs from "fs"
import { connectDB } from "./config/db.js"
import { connectAdminDB, adminDb } from "./config/adminDb.js"
import mongoose from "mongoose"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import storeRouter from "./routes/storeRoute.js"
import authRouter from "./routes/authRoute.js"
import staffRouter from "./routes/staffRoute.js"
import adminUserModel from "./models/adminUserModel.js"
import adminRoleModel from "./models/adminRoleModel.js"

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured");
}
if (!process.env.ADMIN_JWT_SECRET || process.env.ADMIN_JWT_SECRET === process.env.JWT_SECRET) {
    throw new Error("ADMIN_JWT_SECRET must be configured and different from JWT_SECRET");
}

console.log("Paystack key loaded:", process.env.PAYSTACK_SECRET_KEY ? "YES" : "NO");
console.log("Mongo URI loaded:", process.env.MONGO_URI ? "YES" : "NO");
//app config
const app = express()
const port = process.env.PORT || 4000
if (process.env.TRUST_PROXY_HOPS !== undefined) {
    if (!/^[1-9]\d*$/.test(process.env.TRUST_PROXY_HOPS) ||
        !Number.isSafeInteger(Number(process.env.TRUST_PROXY_HOPS))) {
        throw new Error("TRUST_PROXY_HOPS must be a positive integer");
    }
    app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
}

// Ensure the uploads folder exists before multer tries to write to it
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
}

//middleware
app.use(express.json())
app.use(cors())

//api endpoints
app.use("/api/food",foodRouter)
//we can access files in the uploads folder by using http://localhost:4000/images/1782888736566food_20-CTe0fZJ7.png
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/auth",authRouter)
app.use("/api/staff",staffRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/store",storeRouter)


app.get("/",(req,res)=>{
    res.send("API Working")
})

async function start() {
    await connectDB();
    if (mongoose.connection.readyState !== 1) throw new Error("Customer database is not connected");
    await connectAdminDB();
    if (adminDb.name === mongoose.connection.name) {
        throw new Error("Admin and customer databases must have different database names");
    }
    await Promise.all([adminUserModel.init(), adminRoleModel.init()]);
    app.listen(port, "0.0.0.0", ()=>{
        console.log(`Server Started on http://localhost:${port}`)
    });
}

start().catch(error => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
    mongoose.disconnect();
});

