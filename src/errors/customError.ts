class CustomError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 500;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
