import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import UnAuthorizedError from "../errors/unAuthorizedError";
import NotFoundError from "../errors/notfoundError";
import { User as IUser } from "../types/global";
import UnAuthenticatedError from "../errors/unAuthenticatedError";

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
    throw new UnAuthenticatedError("Authentication token is required.");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key"
  ) as IUser;

  req.user = decoded;
  next();
};

export const checkRole = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnAuthorizedError("Authentication required.");
    }

    const user = await User.findById((req.user as IUser).id);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (!roles.includes(user.role)) {
      throw new UnAuthorizedError(
        "You do not have permission to perform this action."
      );
    }

    next();
  };
};
