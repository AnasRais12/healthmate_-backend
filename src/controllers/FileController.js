import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { File } from "../models/Files.js";
import { AiInsight } from "../models/AiInsight.js";
import { callGeminiOrMock } from "../utils/geminiMock.js";
import { ApiError, ApiResponse } from "../utils/CustomResponse.js";
import { isMedicalContent } from "../helper/CommonHelper.js";

const upload = multer({ storage: multer.memoryStorage() });

// ✅ Helper: Stream upload to Cloudinary
const streamUpload = (buffer, mimetype) =>
  new Promise((resolve, reject) => {
    const resourceType = mimetype.includes("pdf") ? "raw" : "auto";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "loan-docs",
        resource_type: "auto", // 👈 yahan fix
        access_mode: "public",
        use_filename: true,
        unique_filename: false,
        type: "upload",
        format: resourceType == "raw" ? "pdf" : undefined,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });


export const uploadFile = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      const userId = req.user?._id;

      if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

      const isMedical = await isMedicalContent(req?.file?.buffer, req?.file?.mimetype, req?.body?.type, req?.body?.reportTitle);
      if (!isMedical.isValid) {
        throw new ApiError(
          400,
          isMedical?.reason,
        );

      }
      // ✅ Upload file
      const uploaded = await streamUpload(req.file.buffer, req.file.mimetype);

      console.log(userId, " uploading file for user ");
      // ✅ Save File record
      const fileDoc = await File.create({
        userId: userId,
        url: uploaded.secure_url,
        filename: req.file.originalname,
        date: new Date(),
        type: req.file.mimetype,
        title: req.body.reportTitle,
        reportType: req.body.type,
        public_id: uploaded?.public_id,

      });

      // ✅ Generate AI Summary
      const gemini = await callGeminiOrMock(isMedical?.pdfText ? isMedical?.pdfText : uploaded.secure_url);

      const insight = await AiInsight.create({
        fileId: fileDoc._id,
        summary_en: gemini?.summary_en,
        summary_roman: gemini?.summary_roman,
        questions_en: gemini?.questions_en,
        questions_roman: gemini?.questions_roman,

      });

      fileDoc.aiInsightId = insight._id;
      await fileDoc.save();
      const populatedFile = await File.findById(fileDoc._id)
        .populate("aiInsightId");
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            populatedFile,
            "File Upload"
          )
        );
    } catch (e) {
      next(e)
    }
  },
];



// 🔹 Get all files for logged-in user
export const getFiles = async (req, res, next) => {
  try {
    const files = await File.find({ userId: req.user?._id })
      .sort({ createdAt: -1 })
      .populate('aiInsightId');
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          files,
          "Fetch Files"
        )
      );
  } catch (e) {
    next(e)
  }
};

// 🔹 Get single file by ID
export const getFileById = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id).populate('aiInsightId');
    if (!file) return res.status(404).json({ msg: 'Not found' });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          file,
          "Fetch File By Id"
        )
      );
  } catch (e) {
    next(e)
  }
};




export const deleteFileById = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id).populate("aiInsightId");
    if (!file) throw new ApiError(404, "File not found");
    const cloudResult = await cloudinary.uploader.destroy(file?.public_id);
    if (cloudResult.result !== "ok" && cloudResult.result !== "not found") {
      throw new ApiError(500, "Failed to delete from Cloudinary");
    }

    if (file.aiInsightId) {
      await AiInsight.findByIdAndDelete(file.aiInsightId._id);
    }

    // 🔹 Delete file record from DB
    await File.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json(
        new ApiResponse(200, req?.params?.id, "File deleted successfully")
      );

  } catch (e) {
    next(e);
  }
};
