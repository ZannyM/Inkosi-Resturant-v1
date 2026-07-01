import foodModel from "../models/foodModel.js";
import fs from 'fs'

//ADD FOOD ITEM

const addfood =  async (req,res) => {
//we store the uploaded file in the image_filename image
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })
    try{
        //the food item will be saved in the database
        await food.save();
        res.json({success:true,message:"Food Added succesfylly"})
    }catch(error){
        console.log(error)
        res.json({success:false,message:"Error while adding food"})
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


export {addfood, listFood, removeFood}