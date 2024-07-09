import express from 'express'
import { signup , login , logout , getMe , updateUser} from '../controllers/userController.js';
import {protectedRoute} from '../middlewares/protectedRoute.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.get('/me' , protectedRoute , getMe);
router.post('/update' , protectedRoute , upload.single('image') , updateUser);
router.post('/signup' , upload.single('image') , signup)
router.post('/login' , login)
router.post('/logout' , logout)


export default router;