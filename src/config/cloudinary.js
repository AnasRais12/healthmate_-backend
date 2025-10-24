// // cloudinaryConfig.mjs ya JS file with "type": "module"
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import dotenv from "dotenv";
// dotenv.config();

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const videoStorage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         resource_type: "video",
//         folder: "youtube-clone-videos",
//         format: async () => "mp4", // force to mp4
//         public_id: (req, file) => `${Date.now()}-${file.originalname}`,
//     },
// });

// export { cloudinary, videoStorage };

// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default cloudinary;
