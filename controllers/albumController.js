import { v2 as cloudinary } from 'cloudinary'
import albumModel from '../models/albumModel.js';
import upload from '../middlewares/multer.js';
import multer from 'multer';
import User from '../models/userModel.js';

const uploadImg = upload.single('image');
const addAlbum = async (req, res) => {
    try {

        uploadImg(req, res, async function(err) {

            if (err instanceof multer.MulterError) {
    
                if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image less than 1.5mb"})
    
            } else if (err) {
               return res.status(400).json({error : err});
            }
            if(!req.user.isAdmin){
                console.log("Only Admin can Add or Remove Albums !");
                return res.status(400).json({error : "Only Admin can Add or Remove Albums !"});
            }

            const existingAlbum = await albumModel.findOne({name : req.body.name});
            if (existingAlbum) {
             return res.status(400).json({error : "Album already Exists !"});
            }
    
            const name = req.body.name;
            const desc = req.body.desc;
            const bgColour = req.body.bgColour;
            const imageFile = req.file;
            console.log(imageFile);
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    
            const albumData = {
                name,
                desc,
                bgColour,
                image: imageUpload.secure_url,
            };
    
            const album = albumModel(albumData);
            await album.save();
    
            return res.json({ message : "Album added Successfully !" });
        })


    } catch (error) {
        console.log(error);
        res.json({ success: false });
        
    }

}

const listAlbum = async (req, res) => {

    try {

        const allAlbums = await albumModel.find({});
        return res.status(200).json({message : allAlbums});

    } catch (error) {

        return res.status(400).json({error});

    }

}

const getAlbum = async (req, res) => {

    const {id} = req.params;
    try {

        const album = await albumModel.findById(id);
        if (!album) {
            return res.status(400).json({error : "Album not found "});
        }
        return res.status(200).json({message : album , userId : req.user._id});

    } catch (error) {
        return res.status(400).json({error});

    }
}

const removeAlbum = async (req, res) => {

    try {

        if(!req.user.isAdmin){
            console.log("Only Admin can Add or Remove Albums !");
            return res.status(400).json({error : "Only Admin can Add or Remove Albums !"});
        }

        const album = await albumModel.findById(req.body.id);
        if(!album){
            return res.status(400).json({error : "album not found !"});
        }

        await cloudinary.uploader.destroy(album.image.split("/").pop().split(".")[0]);
       const deleted = await albumModel.findByIdAndDelete(req.body.id);
       console.log(deleted);
        return res.status(200).json({message : "Album Removed !"});

    } catch (error) {

        res.json({ error });
        
    }

}

const likeAlbum =  async (req , res)=>{

    const {id} = req.params;
    
    try {
        const album = await albumModel.findByIdAndUpdate(id , {
            $push : {
                likes : req.user._id 

            } 
        },
            {
                new : true
            }
        )

        const user = await User.findByIdAndUpdate(req.user._id , {
            $push : {
                likedPosts : id

            } 
        },
            {
                new : true
            }
        )

        res.status(200).json({album , user});
        
    } catch (error) {
        console.log(error);
     res.status(400).json(error);
    }
 
 }

const unlikeAlbum = async (req , res)=>{

    const {id} = req.params;
    
    try {
        const album = await albumModel.findByIdAndUpdate(id , {
            $pull : {
                likes : req.user._id

            } 
        },
            {
                new : true
            }
        )

        const user = await User.findByIdAndUpdate(req.user._id , {
            $pull : {
                likedPosts : id

            } 
        },
            {
                new : true
            }
        )

        res.status(200).json({album , user});
        
    } catch (error) {
     res.status(400).json(error);
    }
 
 }


 const uploadEditImg = upload.single('image');
const updateAlbum = async (req, res) => {
    try {

        uploadEditImg(req, res, async function(err) {

            let name = req.body.name;
            let desc = req.body.desc;
            let bgColour = req.body.bgColour;
            let imageFile = req?.file;

            if (err instanceof multer.MulterError) {
    
                if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image less than 1.5mb"})
    
            } else if (err) {
               return res.status(400).json({error : err});
            }
            if(!req.user.isAdmin){
                console.log("Only Admin can Update Albums !");
                return res.status(400).json({error : "Only Admin can Update Albums !"});
            }

            let existingAlbum = await albumModel.findById(req.body.id);
            if (!existingAlbum) return res.status(404).json({ message: "Album not found" });

            if (imageFile) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(existingAlbum.image.split("/").pop().split(".")[0]);

			const uploadedResponse = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
			imageFile = uploadedResponse.secure_url;
		}
    
        existingAlbum.name = name || existingAlbum.name;
		existingAlbum.desc = desc || existingAlbum.desc;
		existingAlbum.bgColour = bgColour || existingAlbum.bgColour;
		existingAlbum.image = imageFile || existingAlbum.image;

		try {
            existingAlbum = await existingAlbum.save();
            return res.status(200).json({message : "Album Updated Successfully !"});
        } catch (error) {
            console.log(error);
            return res.status(500).json({error : " Given Album Name already Exists !"});
        }
        })


    } catch (error) {
        console.log(error);
        res.json({ success: false });
        
    }

}

const searchAlbum = async (req, res) => {

    const {search} = req.body;
    if (!search) {
        return res.status(400).json({error : "Please enter the Search"});
    }
    try {

        const regex = new RegExp(search, 'i');
        const filteredAlbums = await albumModel.find({ name: { $regex: regex } });
        // console.log(filteredAlbums);
        res.status(200).json({message : filteredAlbums});

    } catch (error) {

        return res.status(400).json({error});

    }
}


export { addAlbum, listAlbum, removeAlbum , likeAlbum , unlikeAlbum , getAlbum , updateAlbum , searchAlbum  }