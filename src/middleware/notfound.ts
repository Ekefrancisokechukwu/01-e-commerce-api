import { Request, Response, NextFunction } from "express";

export const notfound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Not Found - ${req.originalUrl}`,
    },
  });
};
