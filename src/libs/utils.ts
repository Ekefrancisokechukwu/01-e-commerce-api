import jwt from "jsonwebtoken";
import { Response } from "express";
import { User } from "../types/global";
import { Category } from "../models/Category";

export const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    user,
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    user,
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key",
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

export const attachcookiesToResponse = (res: Response, tokenUser: User) => {
  const { accessToken, refreshToken } = generateTokens(tokenUser);

  const oneDay = 1000 * 60 * 60 * 24;

  // testings
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  return { refreshToken, accessToken };
};

export const generateSKU = (name: string, category: string) => {
  const namePart = name.substring(0, 3).toUpperCase();
  const categoryPart = category.substring(0, 2).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `${namePart}-${categoryPart}-${randomPart}`;
};

// Helper function to generate slug
export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
};

export const findOrCreateCategories = async (categoryNames: string[]) => {
  const categoryIds = await Promise.all(
    categoryNames.map(async (catName) => {
      const slug = generateSlug(catName);
      let category = await Category.findOne({ slug });

      if (!category) {
        category = await Category.create({
          name: catName,
          slug,
          description: `${catName} products`,
        });
      }

      return category._id;
    })
  );

  return categoryIds;
};
