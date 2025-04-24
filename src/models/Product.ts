import mongoose, { Document } from "mongoose";
import { Review } from "./Review";

export interface Product extends Document {
  name: string;
  description: string;
  slug: string;
  price: number;
  category: string;
  tags: string[];
  images: string[];
  inStock: number;
  brand?: string;
  rating: number;
}

const productSchema = new mongoose.Schema<Product>(
  {
    name: { type: String, required: [true, "Product name is required"] },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: { type: Number, required: true },
    category: String,
    images: [String],
    inStock: { type: Number, default: 0 },
    tags: [String],
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual field to get reviews
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

// Ensure virtuals are included in toJSON
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export const Product = mongoose.model("Product", productSchema);
