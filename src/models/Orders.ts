import mongoose from "mongoose";

interface OrderItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  selectedOptions?: {
    name: string;
    value: string;
    type: "color" | "size" | "material" | "style";
  };
}

interface Order extends Document {
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  totalPrice: number;
  totalItems: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ordersSchema = new mongoose.Schema<Order>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
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
    ],
    totalPrice: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const Orders = mongoose.model<Order>("Orders", ordersSchema);
