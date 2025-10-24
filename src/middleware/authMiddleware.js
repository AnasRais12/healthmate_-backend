import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/CustomResponse.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader,"headers is here ")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "No token provided"));
    }

    const token = authHeader.split(" ")[1];
    if (!token) next(new ApiError(401, "Unauthorized request"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded?.id).select(
      "-password -verificationCode -__v"
    );

    if (!req.user) {
      return next(new ApiError(401, "User not found"));
    }

    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

// this function checking roles //
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    console.log(roles, "roles is here ");

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You are not authorized to access this route")
      );
    }
    next();
  };
};
