import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

//login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    //the password is hashed using bcrypt
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User Does not exist" })
        }
        //compare between the password entered by the user during log in if 
        //it matches with the password stored on the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }
        const token = createToken(user._id);
        res.json({ success: true, token })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })

    }




}

//data will be encrYPTED
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}


//Register user
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        //checking if user already exist in the db
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }
        //validate email foamt and strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter strong password" })
        }
        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        //new user created
        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword


        })
        //save the user in the database
        const user = await newUser.save()
        //TAKE USER ID and generate token
        const token = createToken(user._id)
        //send token as a respose
        res.json({ success: true, token })




    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })

    }
}

export { loginUser, registerUser };