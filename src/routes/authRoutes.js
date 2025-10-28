import { Router } from "express";
import {
  SignIn,
  Signup,
  Verify,
  ResendVerification,
  ForgotPassword,
  ResetPassword,
  updateProfile,
  changePassword,
    googleLogin,
} from "../controllers/authController.js";
import upload from "../middleware/Upload.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";


const AuthRouter = Router();
AuthRouter.post("/signup", Signup);
AuthRouter.post("/login", SignIn);
AuthRouter.post("/verify", Verify);
AuthRouter.post("/resend", ResendVerification);
AuthRouter.post("/sendPasswordLink", ForgotPassword);
AuthRouter.post("/resetPassword", ResetPassword);
AuthRouter.post("/updateProfile", isAuthenticated, upload.single("avatar"), updateProfile);
AuthRouter.post("/changePassword", isAuthenticated, changePassword);
AuthRouter.post("/googleLogin", googleLogin);



AuthRouter.get("/profile", isAuthenticated, (req, res) => {
  res.json({ message: "Welcome, " + req.user.username, user: req.user });
});

export default AuthRouter;
