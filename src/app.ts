import "express-async-errors";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import { notfound } from "./middleware/notfound";

dotenv.config();

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the E-commerce API" });
});

// Error handling middleware
app.use(notfound);
app.use(errorHandler);

export default app;
