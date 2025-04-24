import jwt from "jsonwebtoken";

export const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
