import { Router } from "express";
import { auth, checkRole } from "../middleware/auth";

import {
  addNewProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getFilters,
} from "../controllers/productContoller";
import upload from "../libs/multer";

const router = Router();

// Public routes
router.route("/").get(getAllProducts);
router.route("/filters").get(getFilters);

router.route("/:id").get(getProduct);

// Admin-only
router.post(
  "/",
  auth,
  checkRole("admin"),
  upload.array("images"),
  addNewProduct
);
router.patch("/:id", auth, checkRole("admin"), updateProduct);
router.delete("/:id", auth, checkRole("admin"), deleteProduct);

export default router;
