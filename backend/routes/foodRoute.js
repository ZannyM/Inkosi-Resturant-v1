import express from "express"
import { addfood, listFood, listFeaturedFood, removeFood, updateFeaturedFood, updateFood } from "../controllers/foodController.js"
import multer from "multer"
import verifyAdmin from "../middleware/verifyAdmin.js"

const foodRouter = express.Router();

//Image Storage Engine

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})


const upload = multer({ storage: storage })

foodRouter.post("/add", verifyAdmin, upload.single("image"), addfood)
foodRouter.get("/list",listFood)
foodRouter.get("/featured", listFeaturedFood)
foodRouter.post("/feature", verifyAdmin, updateFeaturedFood)
foodRouter.post("/update", verifyAdmin, updateFood)
foodRouter.post("/remove", verifyAdmin, removeFood)







export default foodRouter;