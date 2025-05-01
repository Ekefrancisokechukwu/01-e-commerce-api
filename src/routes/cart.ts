import { Router } from "express";
import {
  addItemTOcart,
  clearCart,
  getMyCart,
  removeItem,
  updateCartItem,
} from "../controllers/cartController";
import { auth } from "../middleware/auth";

const router = Router();

// Product routes
router.use(auth);

router.route("/").get(getMyCart);
router.route("/clear").delete(clearCart);
router.route("/item/:productId").post(addItemTOcart);
router.route("/item/:id").patch(updateCartItem).delete(removeItem);

export default router;
