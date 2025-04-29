import "dotenv/config";
import "express-async-errors";
import express, { Express, Request, Response } from "express";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import cartRoutes from "./routes/cart";
import userRoutes from "./routes/user";
import wishlistRoutes from "./routes/wishlist";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import { notfound } from "./middleware/notfound";
const app: Express = express();

import "../src/libs/cloudinary";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// Routes
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/products", productRoutes);
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
