import User from "../models/userModel.js";
import jwt from 'jsonwebtoken'

export const protectedRoute = async (req , res , next)=>{
   try {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(400).json({error : "Unauthorized ! Token Not Provided !"})
    }

    const decoded = jwt.verify(token , process.env.JWT_SECRET);

    if (!decoded) {
        return res.status(400).json({error : "Unauthorized ! Invalid Token !"});
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
        return res.status(404).json({error : "User not Found"});
    }

    req.user = user;
    next();

   } catch (error) {
    console.log(`Error in protectedRoute : ${error}`);
    return res.status(400).json({error});
   }

}