import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { attachcookiesToResponse, generateTokens } from "../libs/utils";
import BadRequestError from "../errors/badRequestError";
import UnAuthenticatedError from "../errors/badRequestError";
import NotFoundError from "../errors/notfoundError";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!email || !password || !username) {
    throw new BadRequestError("Provide all credentials");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new BadRequestError("User already exists");
  }

  // Create new user
  const user = new User({
    username,
    email,
    password,
  });

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    email: user.email,
    id: user._id as string,
    username: user.username,
    role: user.role,
  });

  await user.addRefreshToken(refreshToken);

  res.status(201).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    accessToken,
    refreshToken,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new BadRequestError("Email and password are required.");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find user by email
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new UnAuthenticatedError("Invalid credentials.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnAuthenticatedError("Invalid credentials.");
  }

  const payload = {
    id: user._id as string,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken } = attachcookiesToResponse(res, payload);

  // Persist refresh token
  await user.addRefreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    accessToken,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnAuthenticatedError("Refresh token is required");
  }

  // Verify refresh token
  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key"
  ) as any;

  // Find user and check if refresh token exists
  const user = await User.findOne({ _id: decoded._id });
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new UnAuthenticatedError("Invalid refresh token");
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens({
    email: user.email,
    id: user._id as string,
    username: user.username,
    role: user.role,
  });

  // Remove old refresh token and add new one
  await user.removeRefreshToken(refreshToken);
  await user.addRefreshToken(newRefreshToken);

  res.json({
    accessToken,
    refreshToken: newRefreshToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const user = (req as any).user;

    if (refreshToken) {
      await user.removeRefreshToken(refreshToken);
    }

    res.cookie("accessToken", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      signed: true,
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ error: "Error logging out" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id).select("-password");
  res.json(user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: req.user?.username });

  if (!user) {
    throw new NotFoundError("user not found");
  }

  if (username) {
    user.username = username;
  }

  if (password) {
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }
    user.password = password;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "profile updated successful.",
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
};
