import express from "express"
import { addfood, listFood, listFeaturedFood, removeFood, updateFeaturedFood } from "../controllers/foodController.js"
import multer from "multer"

const foodRouter = express.Router();

//Image Storage Engine

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})


const upload = multer({ storage: storage })

foodRouter.post("/add", upload.single("image"), addfood)
foodRouter.get("/list",listFood)
foodRouter.get("/featured", listFeaturedFood)
foodRouter.post("/feature", updateFeaturedFood)
foodRouter.post("/remove", removeFood)







export default foodRouter;