import mongoose, { Document } from "mongoose";
import "./Review";
import "./Variant";

interface Image {
  public_id: string;
  url: string;
}

export interface Product extends Document {
  name: string;
  description: string;
  slug: string;
  price: number;
  categories: string[];
  tags: string[];
  images: Image[];
  inStock: number;
  brand: string;
  rating: number;
  featured: boolean;
}

const imageSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema<Product>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      minlength: [3, "Product name can not be less than 3 characters"],
      maxlength: [150, "Product name can not be more than 100 characters"],
      trim: true,
    },
    slug: { type: String, unique: true, required: true },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Description can not be less than 10 characters"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: 0,
    },
    categories: [String],
    images: [imageSchema],
    inStock: { type: Number, default: 0 },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    rating: { type: Number, default: 0 },
    brand: String,
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual field to get reviews
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

// Virtual field to get variants
productSchema.virtual("variants", {
  ref: "Variant",
  localField: "_id",
  foreignField: "product",
});

// Ensure virtuals are included in toJSON
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export const Product = mongoose.model("Product", productSchema);
