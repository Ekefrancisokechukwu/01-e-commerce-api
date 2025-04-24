import CustomError from "./customError";

class UnAuthenticatedError extends CustomError {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

export default UnAuthenticatedError;
