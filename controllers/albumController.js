import { v2 as cloudinary } from 'cloudinary'
import albumModel from '../models/albumModel.js';
import jwt from 'jsonwebtoken'

const addAlbum = async (req, res) => {

    try {
        const name = req.body.name;
        const desc = req.body.desc;
        const bgColour = req.body.bgColour;
        const imageFile = req.file;
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

        const albumData = {
            name,
            desc,
            bgColour,
            image: imageUpload.secure_url,
        };

        const album = albumModel(albumData);
        await album.save();

        res.json({ success: true, message: "Album Added" });

    } catch (error) {
        console.log(error);
        res.json({ success: false });
        
    }

}

const listAlbum = async (req, res) => {

    try {

        const allAlbums = await albumModel.find({});
        res.json({ success: true, albums: allAlbums });

    } catch (error) {

        res.json({ success: false });

    }

}

const removeAlbum = async (req, res) => {

    try {

        await albumModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Album Removed" });

    } catch (error) {

        res.json({ success: false });
        
    }

}

const likeAlbum =  async (req , res)=>{

    const {id} = req.params;
    
    try {
     const token = req.cookies.jwt;
        if(token){
            jwt.verify(token , process.env.JWT_SECRET , {} , async (err , info)=>{
                if(err){
                    console.log(err);
                    return res.status(400).json({error : "Unauthorized !!!"})
                }
 
                const album = await albumModel.findByIdAndUpdate(id , {
                 $push : {
                     likes : info.userId
 
                 } 
             },
                 {
                     new : true
                 }
             )
                res.json(album);
            });
        }
    } catch (error) {
        console.log(error);
     res.status(400).json(error);
    }
 
 }

const unlikeAlbum = async (req , res)=>{

    const {id} = req.params;
    
    try {
     const token = req.cookies.jwt;
        if(token){
            jwt.verify(token , process.env.JWT_SECRET , {} , async (err , info)=>{
                if(err){
                    return res.status(400).json({error : "Unauthorized !!!"})
                }
 
                const album = await albumModel.findByIdAndUpdate(id , {
                 $pull : {
                     likes : info.userId
 
                 } 
             },
                 {
                     new : true
                 }
             )
                // console.log(album)
                res.json(album);
            });
        }
    } catch (error) {
     res.status(400).json(error);
    }
 
 }

export { addAlbum, listAlbum, removeAlbum , likeAlbum , unlikeAlbum  }