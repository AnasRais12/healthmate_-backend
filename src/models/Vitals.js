import mongoose from "mongoose";
const VitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true, // yahan required: true sahi syntax hai
  },
  date: Date,
  username: String,
  bp: String,
  sugar: Number,
  weight: Number,
  notes: String
}, { timestamps: true });


export const Vital = mongoose.model('Vital', VitalSchema);