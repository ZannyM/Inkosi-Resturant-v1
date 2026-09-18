import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type:String, required:true},
    description: {type:String, required:true},
    price: {type:Number, required:true},
    image:{type:String, required:true},
    category:{type:String, required:true},
    isFeatured: { type: Boolean, default: false },
    featuredUpdatedAt: { type: Date, default: null },
    // Per-item PDP customization controls, set from the admin panel
    customization: {
        addOnsEnabled: { type: Boolean, default: false },
        addOns: [{ name: { type: String, required: true }, price: { type: Number, default: 0 } }],
        spiceLevelEnabled: { type: Boolean, default: false },
        notesEnabled: { type: Boolean, default: true }
    }
})

const foodModel = mongoose.models.food || mongoose.model("food",foodSchema);

export default foodModel;