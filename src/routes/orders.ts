import { Router } from "express";
import { checkout, getMyOrders } from "../controllers/ordersController";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/checkout", auth, checkout);
router.get("/myOrders", auth, getMyOrders);

export default router;
