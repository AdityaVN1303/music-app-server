import { v2 as cloudinary } from 'cloudinary'
import playlistModel from '../models/playlistModel.js';
import upload from '../middlewares/multer.js';
import multer from 'multer';

const uploadImg = upload.single('image');
export const addPlaylist = async (req, res) => {
    try {

        uploadImg(req, res, async function(err) {

            if (err instanceof multer.MulterError) {
    
                if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image less than 1.5mb"})
    
            } else if (err) {
               return res.status(400).json({error : err});
            }

            const existingPlaylist = await playlistModel.findOne({name : req.body.name});
            if (existingPlaylist) {
             return res.status(400).json({error : "Playlist already Exists !"});
            }
    
            const author = req.user.username;
            const name = req.body.name;
            const desc = req.body.desc;
            const imageFile = req.file;
            // console.log(imageFile);
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    
            const playlistData = {
                name,
                desc,
                author,
                image: imageUpload.secure_url,
            };
    
            const playlist = playlistModel(playlistData);
            await playlist.save();
    
            return res.json({ message : "Playlist added Successfully !" });
        })


    } catch (error) {
        console.log(error);
        res.json({ success: false });
        
    }
}

export const listPlaylist = async (req, res) => {

    try {

        const allPlaylists = await playlistModel.find({author : req.user.username}).populate('songs');
        // console.log(allPlaylists);
        if (allPlaylists.length === 0) {
            return res.status(400).json({error : "No Playlists Found !"});
        }

        return res.status(200).json({message : allPlaylists});

    } catch (error) {
        console.log(error);
        return res.status(400).json({error});

    }

}

export const getPlaylist = async (req, res) => {

    const {id} = req.params;
    try {

        const playlist = await playlistModel.findById(id).populate('songs');
        if (!playlist) {
            return res.status(400).json({error : "Playlist not found "});
        }
        return res.status(200).json({message : playlist});

    } catch (error) {
        return res.status(400).json({error});

    }
}

export const removePlaylist = async (req, res) => {

    try {

        const playlist = await playlistModel.findById(req.body.id);

        if (playlist.author !== req.user.username) {
            return res.status(400).json({error : "Only owner can delete their playlists !"});
        }

        if(!playlist){
            return res.status(400).json({error : "Playlist not found !"});
        }

        await cloudinary.uploader.destroy(playlist.image.split("/").pop().split(".")[0]);
       const deleted = await playlistModel.findByIdAndDelete(req.body.id);
    //    console.log(deleted);
        return res.status(200).json({message : "Playlist Removed !"});

    } catch (error) {

        res.json({ error });
        
    }

}

const uploadEditImg = upload.single('image');
export const updatePlaylist = async (req, res) => {
    try {

        uploadEditImg(req, res, async function(err) {

            let name = req.body.name;
            let desc = req.body.desc;
            let imageFile = req?.file;

            if (err instanceof multer.MulterError) {
    
                if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({error : "Upload Image less than 1.5mb"})
    
            } else if (err) {
               return res.status(400).json({error : err});
            }

            let existingPlaylist = await playlistModel.findById(req.body.id);
            if (!existingPlaylist) return res.status(404).json({ message: "Playlist not found" });

            if (existingPlaylist.author !== req.user.username) {
                return res.status(400).json({error : "Only owner can update their playlists !"});
            }

            if (imageFile) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(existingPlaylist.image.split("/").pop().split(".")[0]);

			const uploadedResponse = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
			imageFile = uploadedResponse.secure_url;
		}
    
        existingPlaylist.name = name || existingPlaylist.name;
		existingPlaylist.desc = desc || existingPlaylist.desc;
		existingPlaylist.image = imageFile || existingPlaylist.image;

		try {
            existingPlaylist = await existingPlaylist.save();
            return res.status(200).json({message : "Playlist Updated Successfully !"});
        } catch (error) {
            console.log(error);
            return res.status(500).json({error : " Given Playlist Name already Exists !"});
        }
        })


    } catch (error) {
        console.log(error);
        res.json({ success: false });
        
    }

}


export const addSong = async (req , res)=>{
    try {
        const {id} = req.body;
        const {playlistid} = req.params;

        const songList = await playlistModel.findById(playlistid);
        const isPresent = await songList.songs.includes(id);

            const data = await playlistModel.findByIdAndUpdate(playlistid , {
                $addToSet : {
                    songs : id
                } 
            },
                {
                    new : true
                }
            )
            // console.log(data);
            if (!data || isPresent) {
                return res.status(400).json({error : "Song already exists in Playlist !"});
            }
            else{
                return res.status(200).json({message : "Song added !"});
            }


    } catch (error) {
        console.log(`Error in addSong Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}

export const removeSong = async (req , res)=>{
    try {
        const {id} = req.body;
        const {playlistid} = req.params;

            await playlistModel.findByIdAndUpdate(playlistid , {
                $pull : {
                    songs : id
                } 
            },
                {
                    new : true
                }
            )

        return res.status(200).json({message : "Song Removed from Playlist !"});


    } catch (error) {
        console.log(`Error in addSong Controller : ${error.message}`);
        return res.status(400).json({error : "Internal Server Error"});
    }
}