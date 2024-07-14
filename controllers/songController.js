import { v2 as cloudinary } from 'cloudinary'
import songModel from '../models/songModel.js';
import upload from '../middlewares/multer.js';
import multer from 'multer';

const uploadData = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }])
const addSong = async (req, res) => {
    if(!req.user.isAdmin){
        console.log("Only Admin can Add or Remove Songs !");
        return res.status(400).json({error : "Only Admin can Add or Remove Songs!"});
    }

    try {

        uploadData(req, res, async function(err) {

            if (err instanceof multer.MulterError) {
    
                if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image/Song less than 1.5mb"})
    
            } else if (err) {
               return res.status(400).json({error : err});
            }

        const name = req.body.name;
        const desc = req.body.desc;
        const album = req.body.album;
        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];
        const audioUpload = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" });
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`;

        const songData = {
            name,
            desc,
            album,
            image: imageUpload.secure_url,
            file: audioUpload.secure_url,
            duration
        };

        const song = songModel(songData);
        await song.save();

        return res.json({ message: "Song Added !" });
        })
    } catch (error) {
        res.status(400).json({error});

    }

}

const listSong = async (req, res) => {

    try {

        const allSongs = await songModel.find({});
        res.status(200).json({ message : allSongs });

    } catch (error) {

        res.status(400).json({ error });
        
    }

}

const getSong = async (req, res) => {

    try {
        const {id} = req.params;
        const song = await songModel.findById(id);
        if(!song){
            return res.status(400).json({error : "Song not Found !"});
        }
        res.status(200).json({ message : song });

    } catch (error) {

        res.status(400).json({ error });
        
    }

}

const removeSong = async (req, res) => {

    try {

        if(!req.user.isAdmin){
            console.log("Only Admin can Add or Remove Songs !");
            return res.status(400).json({error : "Only Admin can Add or Remove Songs!"});
        }

        const song = await songModel.findById(req.body.id);
        if(!song){
            return res.status(400).json({error : "song not found !"});
        }
        
        await cloudinary.uploader.destroy(song.image.split("/").pop().split(".")[0]);
        await cloudinary.uploader.destroy(song.file.split("/").pop().split(".")[0]);
        const deleted = await songModel.findByIdAndDelete(req.body.id);
        console.log(deleted);
         return res.status(200).json({message : "Song Removed !"});

    } catch (error) {

        res.json({ error });
        
    }

}



const uploadEditData = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }])
const updateSong = async (req, res) => {

    try {

        if(!req.user.isAdmin){
            console.log("Only Admin can Update Songs !");
            return res.status(400).json({error : "Only Admin can Update Songs!"});
        }

        uploadEditData(req, res, async function(err) {

            if (err instanceof multer.MulterError) {
    
                if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image/Song less than 1.5mb"})
    
            } else if (err) {
               return res.status(400).json({error : err});
            }

        let name = req.body.name;
        let desc = req.body.desc;
        let album = req.body.album;
        let audioFile = req?.files?.audio?.[0];
        let imageFile = req?.files?.image?.[0];

        let existingSong = await songModel.findById(req.body.id);
        if (!existingSong) {
            return res.status(400).jsoN({error : "Song not Found !"})
        }

        if (audioFile) {
				await cloudinary.uploader.destroy(existingSong.file.split("/").pop().split(".")[0]);

                const uploadedResponse = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" });
                audioFile = uploadedResponse.secure_url;
        }

        if (imageFile) {
            await cloudinary.uploader.destroy(existingSong.image.split("/").pop().split(".")[0]);

            const uploadedResponse = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageFile = uploadedResponse.secure_url;
    }
    const duration = `${Math.floor(audioFile.duration / 60)}:${Math.floor(audioFile.duration % 60)}`;

    existingSong.name = name || existingSong.name;
    existingSong.desc = desc || existingSong.desc;
    existingSong.album = album || existingSong.album;
    existingSong.image = imageFile || existingSong.image;
    existingSong.file = audioFile || existingSong.file;
    existingSong.duration = duration || existingSong.duration;

    try {
        existingSong = await existingSong.save();
        return res.status(200).json({message : "Song Updated Successfully !"});
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : " Given Song Name already Exists !"});
    }
        })
    } catch (error) {
        res.status(400).json({error});

    }

}

const searchSong = async (req, res) => {

    const {search} = req.body;
    if (!search) {
        return res.status(400).json({error : "Please enter the Search"});
    }
    try {

        const regex = new RegExp(search, 'i');
        const filteredSongs = await songModel.find({ name: { $regex: regex } });
        // console.log(filteredSongs);
        res.status(200).json({message : filteredSongs});

    } catch (error) {

        return res.status(400).json({error});

    }
}

export { addSong, listSong, removeSong , getSong , updateSong , searchSong }