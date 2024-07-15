import express from 'express';
import { protectedRoute } from '../middlewares/protectedRoute.js';
import { addPlaylist, addSong, getPlaylist, listPlaylist, removePlaylist, removeSong, updatePlaylist } from '../controllers/playlistController.js';

const playlistRouter = express.Router()

playlistRouter.post('/add', protectedRoute , addPlaylist);
playlistRouter.post('/update' , protectedRoute , updatePlaylist);
playlistRouter.get('/list', protectedRoute , listPlaylist);
playlistRouter.get('/single/:id',  protectedRoute , getPlaylist);
playlistRouter.post('/remove',  protectedRoute , removePlaylist);
playlistRouter.put('/add-song/:playlistid',  protectedRoute , addSong);
playlistRouter.put('/remove-song/:playlistid',  protectedRoute , removeSong);

export default playlistRouter;

