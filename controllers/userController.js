import User from "../models/userModel.js";
import * as EmailValidator from 'email-validator';
import bcrypt from 'bcryptjs'
import {generateTokenAndSetCookie} from '../lib/utils/generateToken.js'
import { v2 as cloudinary } from 'cloudinary'
import upload from "../middlewares/multer.js";
import multer from 'multer'

export const getMe = async (req , res)=>{
    try {
        const user = await User.findById(req.user._id).populate('likedPosts').populate('recentSongs').select('-password');
        return res.status(200).json(user);
    } catch (error) {
        console.log(`Error in getMe Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}

const uploadImg = upload.single('image');
export const signup = async (req , res)=>{
   try {

    uploadImg(req, res, async function(err) {

        if (err instanceof multer.MulterError) {

            if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image less than 1.5mb"})

        } else if (err) {
           return res.status(400).json({error : err});
        }

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
        await newUser.save();
        return res.status(201).json({message : "User Created Successfully"});
    
       } else {
        return res.status(500).json({error : "Invalid User Data"});
       }
        
    })


   } catch (error) {
    console.log(`Error in signup Controller : ${error.message}`);
    return res.status(400).json({error : "Internal Server Error"});
   }
}

export const login = async (req , res)=>{
    try {
        const {username , password} = req.body;

        const existingUser = await User.findOne({username});
        // console.log(existingUser.password);
        const isPasswordCorrect = await bcrypt.compare(password , existingUser?.password || "");

        if (!existingUser || !isPasswordCorrect) {
            return res.status(400).json({error : "Invalid Username or Password"});
        }

        generateTokenAndSetCookie(existingUser._id , res);

        return res.status(200).json({message : "User Logged in Successfully !"});


    } catch (error) {
        console.log(`Error in Login Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}

export const logout = async (req , res)=>{
    try {
        res.cookie("jwt" , "", {
            maxAge : 0,
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        res.status(200).json({message : "Logged Out Successfully !"});
    } catch (error) {
        console.log(`Error in Logout Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}

const singleImg = upload.single('image');
export const updateUser = async (req, res) => {
	try {

        singleImg(req, res, async function(err) {

            if (err instanceof multer.MulterError) {

                if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image less than 100kb"})

                } else if (err) {
                   return res.status(400).json({error : err});
                }

        let { fullname, email, username, currentPassword, newPassword, } = req.body;
        let profileImg = req?.file;
            
        const userId = req.user._id;

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

		try {
            user = await user.save();
            return res.status(200).json({message : "User Updated Successfully !"});
        } catch (error) {
            console.log(error);
            return res.status(500).json({error : "Username or Email already exists !"});
        }

    })
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};


export const addRecent = async (req , res)=>{
    try {
        const {id} = req.body;

        if (req.user.recentSongs.includes(id)) {
            await User.findByIdAndUpdate(req.user._id , {
                $pull : {
                    recentSongs : id
                } 
            },
                {
                    new : true
                }
            )
        }

        if (req.user.recentSongs.length >= 5) {
            await User.findByIdAndUpdate(req.user._id , {
                $pop : {
                    recentSongs : -1
                } 
            },
                {
                    new : true
                }
            )
        }

            await User.findByIdAndUpdate(req.user._id , {
                $push : {
                    recentSongs : id
                } 
            },
                {
                    new : true
                }
            )

        return res.status(200).json({message : "Song added to Recent Songs !"});


    } catch (error) {
        console.log(`Error in addRecent Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}
