import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  addProductReview,
  deleteProductReview,
  getProductReviews,
  updateProductReview,
} from "../controllers/reviewController";

const router = Router();

router.get("/", getProductReviews);

// Protected routes
router.use(auth);

router
  .route("/:productId")
  .post(addProductReview)
  .patch(updateProductReview)
  .delete(deleteProductReview);

export default router;
