import express, {Router} from "express";
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
  updateProfile,
  getHouseOwner,
  verifyResetOtp
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router:Router = express.Router();

router.post("/signup", signup);
router.post("/signin", login);
router.post("/logout", logout);
router.delete("/delete", verifyToken, deleteAccount);
router.post("/verify-email", verifyMail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);   
router.post("/reset-password", resetPassword);
router.get("/check-auth", verifyToken, checkAuth); //for checking of the auth of the user
router.post("/google", google); // OAuth route
router.patch("/update-profile", verifyToken, updateProfile); // Update profile route
router.get("/houseOwner/:id", getHouseOwner);

export default router;
