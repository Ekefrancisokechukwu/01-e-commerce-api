import { Request, Response } from "express";
import { Category } from "../models/Category";

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await Category.find({});

  res.status(200).json(categories);
};
