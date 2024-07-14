import express from 'express'
import { signup , login , logout , getMe , updateUser , addRecent} from '../controllers/userController.js';
import {protectedRoute} from '../middlewares/protectedRoute.js';

const router = express.Router();

router.get('/me' , protectedRoute , getMe);
router.post('/update' , protectedRoute , updateUser);
router.post('/add-recent' , protectedRoute , addRecent);
router.post('/signup' , signup)
router.post('/login' , login)
router.post('/logout' , logout)


export default router;