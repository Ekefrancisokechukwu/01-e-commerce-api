import { Request, Response } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Variant } from "../models/Variant";
import BadRequestError from "../errors/badRequestError";
import NotFoundError from "../errors/notfoundError";
import { Cart } from "../models/Cart";
import { Types } from "mongoose";

// ADD ITEM TO CArt
export const addItemTOcart = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const { productId } = req.params;
  const { variantId, quantity = 1, selectedOptions } = req.body;

  if (!user) {
    throw new BadRequestError("User not found");
  }

  // Find the product and check if it exists
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // If variant is specified, validate it
  let variant = null;
  let itemPrice = product.price;

  if (variantId) {
    variant = await Variant.findById(variantId);

    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    if (variant.product.toString() !== productId) {
      throw new BadRequestError("Variant does not belong to this product");
    }

    itemPrice = variant.basePrice;
  }

  // Find existing cart or create new one
  let cart = await Cart.findOne({ user: user._id });
  if (!cart) {
    cart = await Cart.create({ user: user._id });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (!variantId || item.variant?.toString() === variantId)
  );

  if (existingItemIndex >= 0) {
    // Update existing item
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      product: product._id as Types.ObjectId,
      variant: variant?._id as Types.ObjectId,
      quantity,
      price: itemPrice,
      selectedOptions,
    });
  }

  cart.recalculateTotals();
  await cart.save();

  res.status(201).json({
    success: true,
    message: "Product added to cart",
    cart,
  });
};

//Get my cart items
export const getMyCart = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const cart = await Cart.findOne({ user: user?._id });
  res.status(200).json({ success: true, cart });
};

// Update cart items
export const updateCartItem = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const { productId } = req.params;
  const { variantId, quantity } = req.body;

  if (!user) {
    throw new BadRequestError("User not found");
  }

  if (quantity < 1) {
    throw new BadRequestError("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: user._id });

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (!variantId || item.variant?.toString() === variantId)
  );

  if (itemIndex === -1) {
    throw new NotFoundError("Item not found in cart");
  }

  cart.items[itemIndex].quantity = quantity;
  cart.recalculateTotals();

  res.status(200).json({ message: "Cart item quantity updated", cart });
};

// Remove cart item
export const removeItem = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const { id } = req.params;

  if (!user) {
    throw new BadRequestError("User not found");
  }

  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid item ID");
  }

  const cart = await Cart.findOne({ user: user._id });

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  cart.items = cart.items.filter((item) => item._id?.toString() !== id);

  cart.recalculateTotals();
  await cart.save();

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  res.status(200).json({ message: "Item removed from cart" });
};

// Clear cart item
export const clearCart = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  res.status(200).json({ message: "Cart cleared" });
};
