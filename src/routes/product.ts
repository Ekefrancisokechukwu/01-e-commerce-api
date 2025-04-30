import { Router } from "express";
import { auth, checkRole } from "../middleware/auth";

import {
  addNewProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productContoller";
import upload from "../libs/multer";

const router = Router();

// Public routes
router.route("/").get(getAllProducts);
router.route("/:id").get(getProduct);

// Protected routes (Admin only)
router.use(auth, checkRole("admin"));

// Product routes
router.route("/").post(upload.array("images"), addNewProduct);
router.route("/:id").patch(updateProduct).delete(deleteProduct);

export default router;
