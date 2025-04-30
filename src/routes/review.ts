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
router.use(auth);

router
  .route("/:productId/reviews")
  .post(addProductReview)
  .patch(updateProductReview)
  .delete(deleteProductReview);

export default router;
