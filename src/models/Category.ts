import mongoose from "mongoose";

interface Category extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt: Date;
}

const categorySchema = new mongoose.Schema<Category>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

export const Category = mongoose.model("Category", categorySchema);
