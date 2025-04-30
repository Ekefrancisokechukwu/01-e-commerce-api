import { Request, Response } from "express";

const checkout = async (req: Request, res: Response) => {
  res.status(201).json({ message: "Order placed" });
};

const getMyOrders = async (req: Request, res: Response) => {
  res.status(200).json({ message: "my orders" });
};

const cancelOrder = async (req: Request, res: Response) => {
  res.status(201).json({ message: "orders canceld" });
};
