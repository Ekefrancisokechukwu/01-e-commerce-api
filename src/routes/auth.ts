import { Router } from "express";
import {
  register,
  login,
  getProfile,
  refreshToken,
  logout,
} from "../controllers/authController";
import { auth } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.get("/profile", auth, getProfile);
router.post("/logout", auth, logout);

export default router;
