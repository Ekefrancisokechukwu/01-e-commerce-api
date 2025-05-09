import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { auth } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.route("/me").get(auth, getProfile).put(auth, updateProfile);
router.post("/logout", auth, logout);

export default router;
