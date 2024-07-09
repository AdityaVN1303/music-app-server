import User from "../models/userModel.js";
import * as EmailValidator from 'email-validator';
import bcrypt from 'bcryptjs'
import {generateTokenAndSetCookie} from '../lib/utils/generateToken.js'
import { v2 as cloudinary } from 'cloudinary'

export const getMe = async (req , res)=>{
    try {
        const user = await User.findById(req.user._id).select('-password');
        return res.status(200).json(user);
    } catch (error) {
        console.log(`Error in getMe Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}


export const signup = async (req , res)=>{
   try {
    const {fullname , username , email , password} = req.body;
    const imageFile = req.file;
   const validate =  EmailValidator.validate(email);

   if(!validate){
    return res.status(400).json({error : "Please enter a Valid Email"});
   }

   const existingUser = await User.findOne({username});
   if (existingUser) {
    return res.status(400).json({error : "Username already Taken!"})
   }

   const existingEmail = await User.findOne({email});
   if (existingEmail) {
    return res.status(400).json({error : "Email already Exists!"})
   }

   if(password.length < 6){
    return res.status(400).json({error : "Password Must be atleast 6 letters Long !"})
   }

   const salt = await bcrypt.genSalt(10)
   const hashedPass = await bcrypt.hash(password , salt);

   const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

   const newUser = new User({
    username , 
    password : hashedPass ,
    fullname , 
    email ,
    profileImg : imageUpload.secure_url , 
    isAdmin : false
   });

   if (newUser) {
    generateTokenAndSetCookie(newUser._id , res);
    await newUser.save();

    return res.status(201).json({
        _id : newUser._id , 
        username : newUser.username,
        fullname : newUser.fullname , 
        email : newUser.email, 
        profileImg : newUser.profileImg,  
    })

   } else {
    return res.status(500).json({error : "Invalid User Data"});
   }


   } catch (error) {
    console.log(`Error in signup Controller : ${error.message}`);
    return res.status(400).json({error : "Internal Server Error"});
   }
}

export const login = async (req , res)=>{
    try {
        const {username , password} = req.body;

        const existingUser = await User.findOne({username});
        console.log(password);
        const isPasswordCorrect = await bcrypt.compare(password , existingUser?.password || "");

        if (!existingUser || !isPasswordCorrect) {
            return res.status(400).json({error : "Invalid Username or Password"});
        }

        generateTokenAndSetCookie(existingUser._id , res);


        return res.status(200).json({
            _id : existingUser._id , 
            username : existingUser.username,
            fullname : existingUser.fullname , 
            email : existingUser.email, 
            profileImg : existingUser.profileImg, 
        })


    } catch (error) {
        console.log(`Error in Login Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}

export const logout = async (req , res)=>{
    try {
        res.cookie("jwt" , "", {
            maxAge : 0
        })
        res.status(200).json({message : "Logged Out Successfully !"});
    } catch (error) {
        console.log(`Error in Logout Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}

export const updateUser = async (req, res) => {
	let { fullname, email, username, currentPassword, newPassword, } = req.body;
	let profileImg = req.file;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);

			const uploadedResponse = await cloudinary.uploader.upload(profileImg.path, { resource_type: "image" });
			profileImg = uploadedResponse.secure_url;
		}

		user.email = email || user.email;
		user.fullname = fullname || user.fullname;
		user.username = username || user.username;
		user.profileImg = profileImg || user.profileImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

