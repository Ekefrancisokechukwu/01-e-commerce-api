import mongoose, { Document } from "mongoose";

export interface Review extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

interface ReviewModel extends mongoose.Model<Review> {
  updateProductRating(productId: mongoose.Types.ObjectId): Promise<void>;
}

const reviewSchema = new mongoose.Schema<Review>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to update product rating
reviewSchema.statics.updateProductRating = async function (
  productId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      rating: result[0]?.averageRating || 0,
    });
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

// Middleware to update product rating after save
reviewSchema.post("save", async function () {
  await (this.constructor as ReviewModel).updateProductRating(this.product);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.updateProductRating(doc.product);
  }
});

export const Review = mongoose.model<Review, ReviewModel>(
  "Review",
  reviewSchema
);
