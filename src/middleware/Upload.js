// import multer from "multer";
// import { videoStorage } from "../config/cloudinary.js"; // add `.js` if using ESM

// const upload = multer({ storage: videoStorage });

// export default upload;

// middleware/upload.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/upload/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

export default upload;
