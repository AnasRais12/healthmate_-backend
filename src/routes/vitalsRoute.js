import { Router } from "express";
import { addVital, deleteVital, getVitals, updateVital } from "../controllers/VitalsController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const verifyRouter = Router();

verifyRouter.post('/addVitals', isAuthenticated, addVital);
verifyRouter.get('/getVitals/:userId', isAuthenticated, getVitals);
verifyRouter.delete('/deleteVital/:id', isAuthenticated, deleteVital);
verifyRouter.put('/updateVital/:id', isAuthenticated, updateVital);
export default verifyRouter;
