import mongoose from "mongoose";
const Schema = new mongoose.Schema({
  fileId: { type: mongoose.Types.ObjectId, ref: 'File' },
  summary_en: String,
  summary_roman: String,
  questions_en: String,
  questions_roman: String,
  recommendations: mongoose.Schema.Types.Mixed,
}, { timestamps: true });
export const AiInsight = mongoose.model('AiInsight', Schema);
