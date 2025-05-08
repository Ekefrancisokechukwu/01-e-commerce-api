import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Variant } from "../models/Variant";
import BadRequestError from "../errors/badRequestError";
import NotFoundError from "../errors/notfoundError";
import mongoose from "mongoose";
import { uploadBufferToCloudinary } from "../libs/uploadToCloudinary";
import { v2 as cloudinary } from "cloudinary";
import { findOrCreateCategories, generateSlug } from "../libs/utils";

// Create a new product with variants
export const addNewProduct = async (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    categories,
    tags,
    inStock,
    brand,
    featured,
    variants,
  } = req.body;

  if (!name || !description || !price) {
    throw new BadRequestError("Please provide all required fields");
  }

  const existingProduct = await Product.findOne({ name });

  if (existingProduct) {
    throw new BadRequestError("Name must be unique");
  }

  if (!req.files || req.files.length === 0) {
    throw new BadRequestError("Please provide an image file");
  }

  // Generate slug from name
  const slug = generateSlug(name);

  // Handle product images
  const uploadedImages = [];
  try {
    for (const file of req.files as Express.Multer.File[]) {
      // Validate file buffer
      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestError("Invalid image file: Empty buffer");
      }

      const uploadedImage = await uploadBufferToCloudinary(
        file.buffer,
        "products"
      );
      uploadedImages.push(uploadedImage);
    }

    //  handle categories
    const categoryNames: string[] = JSON.parse(categories);
    const categoryIds = await findOrCreateCategories(categoryNames);

    // Create the product with the uploaded images
    const product = await Product.create({
      name,
      description,
      categories: categoryIds,
      slug,
      price,
      tags: JSON.parse(tags),
      images: uploadedImages,
      inStock,
      brand,
      featured,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "categories"
    );

    // Handle variants if provided
    if (variants) {
      const variantsArray = JSON.parse(variants);
      if (variantsArray && variantsArray.length > 0) {
        const variantPromises = variantsArray.map((variant: any) =>
          Variant.create({
            ...variant,
            product: product._id,
          })
        );
        await Promise.all(variantPromises);
      }
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    // Cleanup: Delete any uploaded images if product creation fails
    if (uploadedImages.length > 0) {
      await Promise.all(
        uploadedImages.map(async (image) => {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (cleanupError) {
            console.error("Failed to cleanup image:", cleanupError);
          }
        })
      );
    }
    throw error; // Re-throw the error to be handled by error middleware
  }
};

// Get all products with optional filtering and pagination
export const getAllProducts = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    category,
    brand,
    minPrice,
    maxPrice,
    featured,
    search,
    color,
    tags,
    availability,
    rating,
  } = req.query;

  const query: any = {};

  // Build filter query
  if (category) query.categories = category;
  if (brand) query.brand = brand;
  if (featured) query.featured = featured === "true";
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by color via Variants
  if (color) {
    // Find all product IDs that have a variant matching the color
    const variantProductIds = await Variant.find({
      color: color as string,
    }).distinct("product");

    if (variantProductIds.length === 0) {
      // No products with that color
      res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        totalPages: 0,
        currentPage: Number(page),
        products: [],
      });
      return;
    }

    // Constrain the product query to those IDs
    query._id = query._id
      ? { ...query._id, $in: variantProductIds }
      : { $in: variantProductIds };
  }

  const products = await Product.find(query)
    .sort(sort as string)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate("categories")
    .populate("variants")
    .populate("reviews");

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    products,
    count: products.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
  });
};

// Get a single product by ID or slug
export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

  const query = isValidObjectId
    ? { $or: [{ _id: id }, { slug: id }] }
    : { slug: id };

  const product = await Product.findOne(query)
    .populate("variants")
    .populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "username",
      },
    });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  res.status(200).json(product);
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // If name is being updated, generate new slug
  if (updateData.name) {
    updateData.slug = generateSlug(updateData.name);
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("variants");

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // Delete image from Cloudinary
  await Promise.all(
    product.images.map(async (image) => {
      await cloudinary.uploader.destroy(image.public_id);
    })
  );

  // Delete associated variants
  await Variant.deleteMany({ product: id });

  // Delete the product
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};
