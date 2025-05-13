import { Request, Response } from "express";
import { User } from "../models/User";
import BadRequestError from "../errors/badRequestError";
import { Product } from "../models/Product";
import NotFoundError from "../errors/notfoundError";
import { Review } from "../models/Review";

export const addProductReview = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const { productId } = req.params;
  const { comment, rating } = req.body;

  if (!user) {
    throw new BadRequestError("User not found");
  }

  if (!comment.trim()) {
    throw new BadRequestError("Comment is required!");
  }

  if (rating < 1) {
    throw new BadRequestError("Rating must be at least 1");
  }

  // Find the product and check if it exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  //  Check if user already submitted a review for this product
  const existingReview = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (existingReview) {
    throw new BadRequestError("You have already reviewed this product");
  }

  const review = new Review({
    product: product._id,
    user: user._id,
    rating,
    comment,
  });

  await review.save();

  res.status(200).json({ message: "Review added successfully", review });
};

export const updateProductReview = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!user) {
    throw new BadRequestError("User not found");
  }

  if (!comment?.trim()) {
    throw new BadRequestError("Comment is required");
  }

  const review = await Review.findOne({ user: user._id, product: productId });

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  review.rating = rating;
  review.comment = comment;
  await review.save();

  res.status(200).json({ message: "Review updated", review });
};

export const getProductReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId });

  res.status(200).json({ success: true, reviews });
};

export const deleteProductReview = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const { productId } = req.params;

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const review = await Review.findOneAndDelete({
    user: user._id,
    product: productId,
  });

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  res.status(200).json({ message: "Review deleted" });
};
