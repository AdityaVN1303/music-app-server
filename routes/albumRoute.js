import express from 'express';
import { addAlbum, listAlbum, removeAlbum , likeAlbum , unlikeAlbum} from '../controllers/albumController.js';
import upload from '../middlewares/multer.js';
import { protectedRoute } from '../middlewares/protectedRoute.js';

const albumRouter = express.Router()

albumRouter.post('/add', upload.single('image'), addAlbum);
albumRouter.get('/list',listAlbum);
albumRouter.post('/remove',removeAlbum)
albumRouter.put('/like/:id' , likeAlbum);
albumRouter.put('/unlike/:id' , unlikeAlbum);

export default albumRouter;

