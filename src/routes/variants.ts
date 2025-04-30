import { Router } from "express";

import {
  addVariant,
  deleteVariant,
  updateVariant,
} from "../controllers/variantController";
import { auth, checkRole } from "../middleware/auth";

const router = Router();

// Protected routes (Admin only)
router.use(auth, checkRole("admin"));

// Variant routes
router.route("/:productId/variants").post(addVariant);

router
  .route("/:productId/variants/:variantId")
  .patch(updateVariant)
  .delete(deleteVariant);

export default router;
