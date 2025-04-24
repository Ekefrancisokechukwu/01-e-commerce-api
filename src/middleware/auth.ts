import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import UnAuthorizedError from "../errors/unAuthorizedError";
import NotFoundError from "../errors/notfoundError";
import { User as IUser } from "../types/global";

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies.accessToken;

  if (!token) {
    throw new UnAuthorizedError("Authentication token is required.");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key"
  ) as IUser;

  req.user = decoded;
  next();
};
