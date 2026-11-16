import express from "express"
import { addfood, listFood, listFeaturedFood, removeFood, updateFeaturedFood, updateFood } from "../controllers/foodController.js"
import multer from "multer"
import verifyAdmin, { requirePermission } from "../middleware/verifyAdmin.js"

const foodRouter = express.Router();

//Image Storage Engine

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})


const upload = multer({ storage: storage })

foodRouter.post("/add", verifyAdmin, requirePermission("catalog:write"), upload.single("image"), addfood)
foodRouter.get("/list",listFood)
foodRouter.get("/featured", listFeaturedFood)
foodRouter.post("/feature", verifyAdmin, requirePermission("catalog:write"), updateFeaturedFood)
foodRouter.post("/update", verifyAdmin, requirePermission("catalog:write"), updateFood)
foodRouter.post("/remove", verifyAdmin, requirePermission("catalog:write"), removeFood)







export default foodRouter;