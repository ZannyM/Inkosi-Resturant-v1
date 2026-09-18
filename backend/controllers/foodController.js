import foodModel from "../models/foodModel.js";
import fs from 'fs'

const MAX_FEATURED_DISHES = 4;

//multipart form fields arrive as strings, so customization is sent as a JSON string
const parseCustomization = (raw) => {
    const fallback = { addOnsEnabled: false, addOns: [], spiceLevelEnabled: false, notesEnabled: true };
    if (!raw) return fallback;
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return {
            addOnsEnabled: Boolean(parsed.addOnsEnabled),
            addOns: Array.isArray(parsed.addOns)
                ? parsed.addOns
                    .filter((a) => a && a.name && a.name.trim())
                    .map((a) => ({ name: a.name.trim(), price: Number(a.price) || 0 }))
                : [],
            spiceLevelEnabled: Boolean(parsed.spiceLevelEnabled),
            notesEnabled: parsed.notesEnabled !== false
        };
    } catch (error) {
        return fallback;
    }
};

//ADD FOOD ITEM

const addfood =  async (req,res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Image upload is required" });
        }
        //we store the uploaded file in the image_filename image
        let image_filename = `${req.file.filename}`;

        const food = new foodModel({
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            category:req.body.category,
            image:image_filename,
            isFeatured: req.body.isFeatured === "true",
            featuredUpdatedAt: req.body.isFeatured === "true" ? new Date() : null,
            customization: parseCustomization(req.body.customization)
        })

        //the food item will be saved in the database
        await food.save();
        res.json({success:true,message:"Food Added succesfylly"})
    }catch(error){
        console.log(error)
        res.json({success:false,message:"Error while adding food"})
    }

}

const listFeaturedFood = async (req, res) => {
    try {
        const featuredFoods = await foodModel
            .find({ isFeatured: true })
            .sort({ featuredUpdatedAt: -1 })
            .limit(MAX_FEATURED_DISHES);

        res.json({ success: true, data: featuredFoods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error while fetching featured food list" });
    }
}

const updateFeaturedFood = async (req, res) => {
    try {
        const { id, isFeatured } = req.body;

        if (!id || typeof isFeatured !== "boolean") {
            return res.json({ success: false, message: "Food id and isFeatured are required" });
        }

        const food = await foodModel.findById(id);
        if (!food) {
            return res.json({ success: false, message: "Food item not found" });
        }

        if (isFeatured && !food.isFeatured) {
            const featuredCount = await foodModel.countDocuments({ isFeatured: true });
            if (featuredCount >= MAX_FEATURED_DISHES) {
                return res.json({
                    success: false,
                    message: `You can only feature up to ${MAX_FEATURED_DISHES} dishes at once.`
                });
            }
        }

        food.isFeatured = isFeatured;
        food.featuredUpdatedAt = isFeatured ? new Date() : null;
        await food.save();

        res.json({
            success: true,
            message: isFeatured ? "Dish added to featured list" : "Dish removed from featured list"
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating featured dish" });
    }
}
//all food list
const listFood = async (req,res) => {
    try{
        const foods = await foodModel.find({});
        res.json({success:true, data:foods})
    }catch(error){
        console.log(error);
        res.json({success:false, message:"Error while fecthing food list"})

    }

}

//remove food item from the database and also remove the image from the uploads folder
const removeFood = async (req,res) =>{
    try{
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{})
        //delete product data from the mongodb database
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Food item removed successfully"})
    }catch(error){
        console.log(error);
        res.json({success:false, message:"Error while removing food item"})

    }

}

const updateFood = async (req, res) => {
    try {
        const { id, name, description, price, category, isFeatured, customization } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Food item id is required" });
        }

        const food = await foodModel.findById(id);
        if (!food) {
            return res.json({ success: false, message: "Food item not found" });
        }

        if (typeof name === "string") {
            food.name = name.trim();
        }

        if (typeof description === "string") {
            food.description = description.trim();
        }

        if (typeof category === "string") {
            food.category = category;
        }

        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (Number.isNaN(parsedPrice)) {
                return res.json({ success: false, message: "Price must be a valid number" });
            }
            food.price = parsedPrice;
        }

        if (customization !== undefined) {
            food.customization = parseCustomization(customization);
        }

        if (typeof isFeatured === "boolean") {
            if (isFeatured && !food.isFeatured) {
                const featuredCount = await foodModel.countDocuments({ isFeatured: true });
                if (featuredCount >= MAX_FEATURED_DISHES) {
                    return res.json({
                        success: false,
                        message: `You can only feature up to ${MAX_FEATURED_DISHES} dishes at once.`
                    });
                }
            }

            food.isFeatured = isFeatured;
            food.featuredUpdatedAt = isFeatured ? new Date() : null;
        }

        await food.save();
        res.json({ success: true, message: "Food item updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error while updating food item" });
    }
}


export {addfood, listFood, removeFood, updateFood, listFeaturedFood, updateFeaturedFood}