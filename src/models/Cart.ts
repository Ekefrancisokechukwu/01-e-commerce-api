import { Document, Schema, Types } from "mongoose";
import mongoose from "mongoose";

interface CartItem {
  _id?: string;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  // itemTotal: number;
  selectedOptions?: {
    name: string;
    value: string;
    type: "color" | "size" | "material" | "style";
  }[];
}

interface Cart extends Document {
  user: Types.ObjectId;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
  recalculateTotals: () => void;
}

// sub-schema  cart item
const cartItemSchema = new Schema<CartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "Variant" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    selectedOptions: [
      {
        name: String,
        value: String,
        type: {
          type: String,
          enum: ["color", "size", "material", "style"],
        },
      },
    ],
  },
  { _id: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

cartItemSchema.virtual("itemTotal").get(function (this: CartItem) {
  return this.unitPrice * this.quantity;
});

const cartSchema = new Schema<Cart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

cartSchema.methods.recalculateTotals = function () {
  this.totalItems = this.items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );
  this.totalPrice = this.items.reduce(
    (sum: number, item: CartItem) => sum + item.unitPrice * item.quantity,
    0
  );
};

export const Cart = mongoose.model<Cart>("Cart", cartSchema);
