import express from 'express';
import { addAlbum, listAlbum, removeAlbum , updateAlbum , likeAlbum , unlikeAlbum , getAlbum , searchAlbum} from '../controllers/albumController.js';
import { protectedRoute } from '../middlewares/protectedRoute.js';

const albumRouter = express.Router()

albumRouter.post('/add', protectedRoute , addAlbum);
albumRouter.post('/update' , protectedRoute , updateAlbum);
albumRouter.get('/list', listAlbum);
albumRouter.get('/single/:id',  protectedRoute , getAlbum);
albumRouter.post('/remove',  protectedRoute , removeAlbum);
albumRouter.post('/search',  protectedRoute , searchAlbum)
albumRouter.put('/like/:id' , protectedRoute , likeAlbum);
albumRouter.put('/unlike/:id' , protectedRoute , unlikeAlbum);

export default albumRouter;

