import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    author : { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    image: { type: String, required: true },
    songs : [{
        type : mongoose.Schema.Types.ObjectId , 
        ref : "song"
    }] ,
} , {timestamps : true})

const playlistModel = mongoose.models.playlist || mongoose.model("playlist", playlistSchema);

export default playlistModel;