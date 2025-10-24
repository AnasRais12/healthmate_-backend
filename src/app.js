import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { appRouter } from "./routes/index.js";
import { globalErrorHandler } from "./middleware/Common.js";

const app = express();

app.use(cors({}));
// Middleware //
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use("/slips", express.static("slips"));
app.use(cookieParser());

// Routes declaration //
app.use("/", appRouter);

// Global ERROR // 
app.use(globalErrorHandler);


export default app;
