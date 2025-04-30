import { Request, Response } from "express";
import NotFoundError from "../errors/notfoundError";
import { Product } from "../models/Product";
import { Variant } from "../models/Variant";

// Add a variant to a product
export const addVariant = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const variantData = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const variant = await Variant.create({
    ...variantData,
    product: productId,
  });

  res.status(201).json({
    success: true,
    message: "Variant added successfully",
    variant,
  });
};

// Update a variant
export const updateVariant = async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;
  const updateData = req.body;

  const variant = await Variant.findOneAndUpdate(
    { _id: variantId, product: productId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!variant) {
    throw new NotFoundError("Variant not found");
  }

  res.status(200).json({
    success: true,
    message: "Variant updated successfully",
    variant,
  });
};

// Delete a variant
export const deleteVariant = async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;

  const variant = await Variant.findOneAndDelete({
    _id: variantId,
    product: productId,
  });

  if (!variant) {
    throw new NotFoundError("Variant not found");
  }

  res.status(200).json({
    success: true,
    message: "Variant deleted successfully",
  });
};
