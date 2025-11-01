import express from "express";
import {
  login,
  logout,
  signup,
  forgotPassword,
  verifyMail,
  resetPassword,
  checkAuth,
  google,
  deleteAccount,
  updateProfile
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", login);
router.post("/logout", logout);
router.delete("/delete", verifyToken, deleteAccount);
router.post("/verify-email", verifyMail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check-auth", verifyToken, checkAuth); //for checking of the auth of the user
router.post("/google", google); // OAuth route
router.patch("/update-profile", verifyToken, updateProfile); // Update profile route

export default router;
