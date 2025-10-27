import { Vital } from "../models/Vitals.js";
import { ApiResponse } from "../utils/CustomResponse.js";
export const addVital = async (req, res, next) => {
  try {
    const { date, bp, sugar, weight, notes, username } = req.body;
    const v = await Vital.create({ userId: req?.user?._id, date, bp, sugar, weight, notes, username });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          v,
          "vitals Created"
        )
      );
  } catch (e) {
    next(e)
  }
};

export const getVitals = async (req, res, next) => {
  try {
    const vitals = await Vital.find({ userId: req?.user?._id }).sort({ date: -1 });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          vitals,
          "Fetch Data"
        )
      );
  } catch (e) { next(e) }
};


export const deleteVital = async (req, res, next) => {
  try {
    const { id } = req.params; // frontend se id aayegi e.g. /vitals/:id
    const userId = req.userId?._id;

    // Check if record exists and belongs to current user
    const vital = await Vital.findOne({ _id: id, userId });
    if (!vital) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Vital record not found"));
    }
    await Vital.findByIdAndDelete(id);
    res
      .status(200)
      .json(new ApiResponse(200, id, "Vital record deleted successfully"));
  } catch (e) {
    next(e);
  }
};


export const updateVital = async (req, res, next) => {
  try {
    const { id } = req.params;  // frontend se /vitals/:id aayega
    const userId = req.user?._id;
    const updates = req.body;   // frontend se aane wali updated values

    // Record check karein — sirf usi user ka record update ho
    const vital = await Vital.findOne({ _id: id, userId });
    if (!vital) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Vital record not found"));
    }

    // Record update karna
    const updatedVital = await Vital.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true } // updated document return karega
    );

    res
      .status(200)
      .json(new ApiResponse(200, updatedVital, "Vital record updated successfully"));
  } catch (e) {
    next(e);
  }
};
