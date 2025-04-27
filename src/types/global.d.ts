export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "customer";
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
