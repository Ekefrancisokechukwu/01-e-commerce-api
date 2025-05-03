import { Request, Response } from "express";
import { User } from "../models/User";
import NotFoundError from "../errors/notfoundError";
import { Cart } from "../models/Cart";
import BadRequestError from "../errors/badRequestError";
import { Orders } from "../models/Orders";

export const checkout = async (req: Request, res: Response) => {
  const { shippingAddress, paymentMethod } = req.body;
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const cart = await Cart.findOne({ user: user._id });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError("Cart is empty");
  }

  const order = new Orders({
    user: user._id,
    items: cart.items,
    totalPrice: cart.totalPrice,
    totalItems: cart.totalItems,
    paymentStatus: "pending",
    paymentMethod,
    shippingAddress,
  });

  await order.save();

  res.status(201).json({ message: "Order created", order });
};

export const getMyOrders = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const orders = await Orders.findOne({ user: user._id });

  res
    .status(200)
    .json({ success: true, orders: orders || { user: user._id, items: [] } });
};
