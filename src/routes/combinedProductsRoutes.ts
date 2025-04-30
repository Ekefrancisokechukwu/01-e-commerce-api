//combinedRoutes

import express from "express";
import productRoutes from "./product";
import variantsRoutes from "./variants";
import review from "./review";

const router = express.Router();

router.use("/", review);
router.use("/", productRoutes);
router.use("/", variantsRoutes);

export default router;
