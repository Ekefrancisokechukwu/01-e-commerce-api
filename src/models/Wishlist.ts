import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

interface WishList extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
}

const WishlistSchema = new Schema<WishList>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

export const Wishlist = mongoose.model("Wishlist", WishlistSchema);
