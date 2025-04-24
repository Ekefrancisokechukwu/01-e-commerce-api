import CustomError from "./customError";

class UnAuthorizedError extends CustomError {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 403;
  }
}

export default UnAuthorizedError;
