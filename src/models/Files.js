import mongoose from "mongoose";
const FileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true, // yahan required: true sahi syntax hai
  },
  url: String,
  filename: String,
  public_id: String,
  date: Date,
  type: String,
  reportType: String,
  title: String,
  aiInsightId: { type: mongoose.Types.ObjectId, ref: 'AiInsight' },
}, { timestamps: true });

FileSchema.pre('remove', async function (next) {
  try {
    await mongoose.model('AiInsight').deleteMany({ fileId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});
export const File = mongoose.model('File', FileSchema);