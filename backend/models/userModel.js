import mongoose from "mongoose";

//define one schema
const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    cartData:{type:Object, default:{}},
    savedData:{type:Object, default:{}},
    cartRevision:{type:Number, default:0},
    cartMergeIds:{type:[String], default:[]},
    cartMergeDigests:{type:[String], default:[]}
},{minimize:false})

const userModel = mongoose.models.user || mongoose.model("user",userSchema);

export default userModel;