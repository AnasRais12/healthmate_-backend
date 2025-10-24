import { Router } from "express";
import AuthRouter from "./authRoutes.js";
import verifyRouter from "./vitalsRoute.js";
import fileRoutes from "./fileRoutes.js";
export const appRouter = Router();
appRouter.use("/api/v1/users", AuthRouter);
appRouter.use("/api", fileRoutes);
appRouter.use("/api", verifyRouter);


