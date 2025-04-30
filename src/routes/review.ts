import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  addProductReview,
  deleteProductReview,
  getProductReviews,
  updateProductReview,
} from "../controllers/reviewController";

const router = Router();

router.get("/:productId/reviews", getProductReviews);

// Protected routes
router
  .route("/:productId/reviews")
  .post(auth, addProductReview)
  .patch(auth, updateProductReview)
  .delete(auth, deleteProductReview);

export default router;
