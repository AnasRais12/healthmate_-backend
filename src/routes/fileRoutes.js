import { Router } from 'express';
import { uploadFile, getFiles, getFileById, deleteFileById } from '../controllers/FileController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
const fileRoutes = Router();
fileRoutes.post('/upload', isAuthenticated, uploadFile);
fileRoutes.get('/allFiles/:id', isAuthenticated, getFiles);
fileRoutes.get('/files/:id', isAuthenticated, getFileById);
fileRoutes.delete('/deleteFile/:id', isAuthenticated, deleteFileById);


export default fileRoutes
