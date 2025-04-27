import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  errors?: { [key: string]: { message: string } };
  code?: number;
  value?: string;
  path?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customError = {
    statusCode: err.statusCode || 500,
    message: err.message || "Something went wrong",
  };

  console.log("ERROR:", err);

  if (err.name === "ValidationError" && err.errors) {
    customError.statusCode = 400;
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
  }

  if (err.code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const value = (err as any).keyValue[field];
    customError.statusCode = 400;
    customError.message = `Duplicate value for '${field}': "${value}". Please use a different value.`;
  }

  if (err.name === "CastError") {
    customError.statusCode = 400;
    customError.message = `Invalid ${err.path}: "${err.value}"`;
  }

  res.status(customError.statusCode).json({
    success: false,
    error: customError.message,
  });
};

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
