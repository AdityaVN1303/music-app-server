import express from 'express';
import { addSong, listSong, removeSong , getSong , updateSong , searchSong } from '../controllers/songController.js';
import {protectedRoute} from '../middlewares/protectedRoute.js';

const songRouter = express.Router()

songRouter.post('/add', protectedRoute , addSong);
songRouter.post('/update', protectedRoute , updateSong);
songRouter.get('/list' , listSong);
songRouter.get('/single/:id', protectedRoute , getSong);
songRouter.post('/remove', protectedRoute , removeSong);
songRouter.post('/search', protectedRoute , searchSong);

export default songRouter;