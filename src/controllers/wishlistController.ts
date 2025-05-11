import { Request, Response } from "express";
import { User } from "../models/User";
import NotFoundError from "../errors/notfoundError";
import { Wishlist } from "../models/Wishlist";
import BadRequestError from "../errors/badRequestError";
import { Types } from "mongoose";
import { Product } from "../models/Product";

export const addItemToWishlist = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const { productId } = req.params;

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Find the product and check if it exists
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  let wishlist = await Wishlist.findOne({ user: user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: user._id });
  }

  const alreadyExists = wishlist.products.includes(
    product._id as Types.ObjectId
  );

  if (alreadyExists) {
    throw new BadRequestError("Product already in wishlist");
  } else {
    wishlist.products.push(product._id as Types.ObjectId);
  }

  await wishlist.save();

  // Fetch the updated wishlist with populated products
  const updatedWishlist = await Wishlist.findOne({ user: user._id }).populate(
    "products"
  );

  res.status(201).json({
    success: true,
    message: "Product added to wishlist",
    wishlist: updatedWishlist,
  });
};

export const getMyWishlist = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const wishlists = await Wishlist.findOne({ user: user._id }).populate(
    "products"
  );

  res.status(200).json({
    success: true,
    wishlists: wishlists || { user: user._id, products: [] },
  });
};

export const removeItemFromWishlist = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const { productId } = req.params;

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const updatedWishlist = await Wishlist.findOneAndUpdate(
    { user: user._id },
    { $pull: { products: productId } },
    { new: true }
  ).populate("products");

  res.status(200).json({
    success: true,
    message: "Product removed from Wishlist",
    wishlist: updatedWishlist,
  });
};
