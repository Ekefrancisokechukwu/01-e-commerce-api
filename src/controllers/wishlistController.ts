import { Request, Response } from "express";
import { User } from "../models/User";
import NotFoundError from "../errors/notfoundError";

export const addItemToWishlist = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.username);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(201).json({ message: "Added to wishlist" });
};
