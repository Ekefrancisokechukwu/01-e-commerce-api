import "dotenv/config";
import "express-async-errors";
import express, { Express, Request, Response } from "express";
import authRoutes from "./routes/auth";
import cartRoutes from "./routes/cart";
import userRoutes from "./routes/user";
import wishlistRoutes from "./routes/wishlist";
import reviewRoutes from "./routes/review";
import ordersRoutes from "./routes/orders";
import categoryRoutes from "./routes/category";
import combinedProductsRoutes from "./routes/combinedProductsRoutes";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import { notfound } from "./middleware/notfound";
import cors from "cors";

const app: Express = express();

import "./libs/cloudinary";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors({ origin: "*" }));

// Routes
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/orders", ordersRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlists", wishlistRoutes);
app.use("/api/v1/products", combinedProductsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the E-commerce API" });
});

// Error handling middleware
app.use(notfound);
app.use(errorHandler);

export default app;
