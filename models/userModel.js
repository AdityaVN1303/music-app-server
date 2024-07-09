import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username : {
        type : String, 
        required : true, 
        unique : true , 
        trim : true
    },
    fullname : {
        type : String, 
        required : true
    },
    password : {
        type : String, 
        required : true,
        minLength : 6
    },
    email : {
        type : String, 
        required : true, 
        unique : true ,
    },
    profileImg :{
        type : String , 
        required : true ,
    } , 
    isAdmin :{
        type : Boolean , 
        required : true ,
    }


} ,{timestamps : true})

const User = mongoose.models.user || mongoose.model('user' , userSchema);

export default User;