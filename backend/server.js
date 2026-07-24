import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import storeRouter from "./routes/storeRoute.js"


console.log("Paystack key loaded:", process.env.PAYSTACK_SECRET_KEY ? "YES" : "NO");
console.log("Mongo URI loaded:", process.env.MONGO_URI ? "YES" : "NO");
//app config
const app = express()
const port = 4000

//middleware
app.use(express.json())
app.use(cors())

//db connection
connectDB();

//api endpoints
app.use("/api/food",foodRouter)
//we can access files in the uploads folder by using http://localhost:4000/images/1782888736566food_20-CTe0fZJ7.png
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/store",storeRouter)


app.get("/",(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

