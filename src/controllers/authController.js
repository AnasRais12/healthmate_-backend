import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import { generateCode, generateToken } from "../helper/CommonHelper.js";
import cloudinary from "../config/cloudinary.js";
import { ApiError, ApiResponse } from "../utils/CustomResponse.js";
import jwt from "jsonwebtoken";


// export const Signup = async (req, res, next) => {
//   try {
//     const { username, email, password } = req.body;

//     const userExists = await User.findOne({
//       $or: [{ email: email }, { username: username }],
//     });

//     if (userExists) {
//       throw new ApiError(
//         400,
//         userExists.email === email
//           ? "Email already exists"
//           : "Username already exists"
//       );
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const verifyCode = generateCode(6);
//     const user = await User.create({
//       username,
//       email,
//       isVerified: false,
//       password: hashedPassword,
//       verificationCode: verifyCode,
//       expiresAt: new Date(Date.now() + 90 * 1000),
//     });

//     await sendEmail(
//       email,
//       "Verify your email",
//       username,
//       verifyCode
//     );

//     res
//       .status(201)
//       .json(
//         new ApiResponse(
//           201,
//           user.getPublicProfile(),
//           "User registered successfully"
//         )
//       );
//   } catch (err) {
//     next(err); // ✅ pass to global error handler
//   }
// };


export const Signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (userExists) {
      throw new ApiError(
        400,
        userExists.email === email
          ? "Email already exists"
          : "Username already exists"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = generateCode(6);
    const user = await User.create({
      username,
      email,
      // isVerified:false ,
      isVerified: true,
      password: hashedPassword,
      verificationCode: null,
      expiresAt: null,
    });

    // await sendEmail(
    //   email,
    //   "Verify your email",
    //   username,
    //   verifyCode
    // );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          user.getPublicProfile(),
          "User registered successfully"
        )
      );
  } catch (err) {
    next(err); // ✅ pass to global error handler
  }
};

export const SignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) throw new ApiError(400, "Invalid credentials");

    if (!user.isVerified) {
      throw new ApiError(
        403,
        "Please verify your email first",
        [],
        "",
      );
    }

    const token = generateToken(user);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: user?.getPublicProfile(), token },
          "Login success"
        )
      );
  } catch (err) {
    next(err);
  }
};


export const Verify = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      throw new ApiError(404, "User not found", [
        { error: "User not found", field: "email" },
      ]);

    if (user.verificationCode !== code)
      throw new ApiError(400, "Invalid verification code");

    if (user.expiresAt && user.expiresAt < new Date()) {
      user.verificationCode = null;
      user.expiresAt = null;
      await user.save();
      throw new ApiError(400, "Verification code expired");
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, null, "Email verified successfully"));
  } catch (err) {
    next(err);
  }
};


export const ResendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");
    if (user.isVerified) throw new ApiError(400, "User already verified");

    const newCode = generateCode(6);
    user.verificationCode = newCode;
    user.expiresAt = new Date(Date.now() + 90 * 1000);
    await user.save();

    await sendEmail(
      user.email,
      "Your new verification code",
      user.username,
      newCode
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { expiresAt: user.expiresAt },
          "New verification code sent"
        )
      );
  } catch (err) {
    next(err);
  }
};

// this function is used to forget password featrue

// export const ForgotPassword = async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) throw new ApiError(404, "User not found");

//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.RESET_PASSWORD_SECRET, // secret key
//       { expiresIn: "10m" } // expires in 10 minutes
//     );

//     await sendEmail(
//       user.email,
//       "Reset Your Password",
//       user.username,
//       ``,
//       "Reset Your Password",
//       `To reset your password, please use the verification code below. <br />
// This link expires in <strong>10 minute</strong>.`,
//       `resetPassword/${token}`
//     );

//     res
//       .status(200)
//       .json(new ApiResponse(200, null, "Reset link sent to your email"));
//   } catch (err) {
//     next(err);
//   }
// };

export const ForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    const token = jwt.sign(
      { userId: user._id },
      process.env.RESET_PASSWORD_SECRET, // secret key
      { expiresIn: "10m" } // expires in 10 minutes
    );

    //     await sendEmail(
    //       user.email,
    //       "Reset Your Password",
    //       user.username,
    //       ``,
    //       "Reset Your Password",
    //       `To reset your password, please use the verification code below. <br />
    // This link expires in <strong>10 minute</strong>.`,
    //       `resetPassword/${token}`
    //     );

    res
      .status(200)
      .json(new ApiResponse(200, { url: `https://healthmate-gray.vercel.app/resetPassword/${token}` }, "Reset link sent to your email"));
  } catch (err) {
    next(err);
  }
};

export const ResetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) throw new ApiError(404, "User not found");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await User.findByIdAndUpdate(decoded.userId, user, { new: true });
    res
      .status(200)
      .json(new ApiResponse(200, null, "Password reset successfully"));
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(400, "Reset link has expired"));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new ApiError(400, "Invalid reset token"));
    }
    next(err);
  }
};



export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const name = req.body.username;
    const email = req.body.email;
    let avatarUrl = null;

    // Agar avatar file aayi ho (Multer ke through)
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
      });
      avatarUrl = upload.secure_url;
    }

    // User find karo
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Update fields
    if (name) user.username = name;
    if (email) user.email = email;
    if (avatarUrl) user.avatar = avatarUrl;
    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res
      .status(200)
      .json(new ApiResponse(200, userWithoutPassword, "Profile updated successfully"));
  } catch (err) {
    next(err);
  }
};


export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id; // token se aaya user id
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Both current and new passwords are required");
    }

    // User find karo
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Current password verify karo
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new ApiError(400, "Current password is incorrect");

    // New password hash karo
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json(
      new ApiResponse(200, null, "Password changed successfully")
    );
  } catch (err) {
    next(err);
  }
};





export const userExist = async (req, res, next) => {
  try {
    const { email, } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");
    const token = generateToken(user);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: user?.getPublicProfile(), token },
          "Login success"
        )
      );
  } catch (err) {
    next(err);
  }
};
