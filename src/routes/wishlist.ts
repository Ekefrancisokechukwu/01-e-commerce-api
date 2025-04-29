import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  addItemToWishlist,
  getMyWishlist,
  removeItemFromWishlist,
} from "../controllers/wishlistController";

const router = Router();

// Protected routes
router.use(auth);

router.get("/", getMyWishlist);
router
  .route("/:productId")
  .post(addItemToWishlist)
  .delete(removeItemFromWishlist);

export default router;
