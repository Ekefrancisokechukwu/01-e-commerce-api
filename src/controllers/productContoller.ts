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

export const getFilters = async (req: Request, res: Response) => {
  // Stocks
  const result = await Product.aggregate([
    {
      $facet: {
        inStock: [{ $match: { inStock: { $gt: 0 } } }, { $count: "count" }],
        outOfStock: [{ $match: { inStock: 0 } }, { $count: "count" }],
      },
    },
  ]);

  // Product stock
  const stockStats = {
    inStock: result[0].inStock[0]?.count || 0,
    outOfStock: result[0].outOfStock[0]?.count || 0,
  };

  // products heightst price
  const [product] = await Product.aggregate([
    { $sort: { price: -1 } },
    { $limit: 1 },
    { $project: { price: 1 } },
  ]);

  // product tags
  const tags = await Product.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    {
      $project: {
        tag: "$_id",
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // colors
  const uniqueColorOptions = await Variant.aggregate([
    { $unwind: "$options" },
    { $match: { "options.type": "color" } },
    {
      $group: {
        _id: {
          hexCode: "$options.hexCode",
          displayName: "$options.displayName",
          value: "$options.value",
        },
      },
    },
    {
      $project: {
        _id: 0,
        hexCode: "$_id.hexCode",
        displayName: "$_id.displayName",
        value: "$_id.value",
      },
    },
  ]);

  // brands
  const productsByBrand = await Product.aggregate([
    {
      $group: {
        _id: "$brand",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        brand: "$_id",
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({
    stockStats,
    productHighestPrice: product.price,
    tags,
    colors: uniqueColorOptions,
    brands: productsByBrand,
  });
};

// Helper function to get sort options
const getSortOptions = (sort: string | undefined) => {
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_low_high: { price: 1 },
    price_high_low: { price: -1 },
    rating_high_low: { rating: -1 },
    name_asc: { name: 1 },
    name_dec: { name: -1 },
    featured: { featured: -1 },
  };
  const sortKey = sort || "newest";
  return sortMap[sortKey] || { createdAt: -1 };
};

// Helper function to build filter query
const buildFilterQuery = (queryParams: any) => {
  const {
    category,
    featured,
    minPrice,
    maxPrice,
    brands,
    tags,
    availability,
    search,
  } = queryParams;

  const query: any = {};

  if (category) query.categories = category;
  if (featured) query.featured = featured === "true";

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (brands) {
    const selectedBrands = (brands as string).split(",");
    query.brand = { $in: selectedBrands };
  }

  if (tags) {
    const selectedTags = (tags as string).split(",");
    query.tags = { $in: selectedTags };
  }

  if (availability) {
    query.inStock = {};
    if (availability === "inStock") {
      query.inStock.$gt = 0;
    }
    if (availability === "outOfStock") {
      query.inStock.$lte = 0;
    }
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  return query;
};

// Helper function to handle color filtering
const handleColorFilter = async (
  colors: string | undefined,
  existingQuery: any
) => {
  if (!colors) return existingQuery;

  const colorArray = (colors as string).split(",").map((c) => c.trim());

  const variantsWithColors = await Variant.find({
    options: {
      $elemMatch: {
        type: "color",
        value: { $in: colorArray },
      },
    },
  }).select("product");

  const productIds = [
    ...new Set(variantsWithColors.map((v) => v.product.toString())),
  ];

  if (productIds.length === 0) return null;

  return {
    ...existingQuery,
    _id: { $in: productIds },
  };
};

// Get all products with optional filtering and pagination
export const getAllProducts = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, sort, colors } = req.query;

  // Get sort options
  const sortOption = getSortOptions(sort as string);

  // Build base filter query
  const baseQuery = buildFilterQuery(req.query);

  // Handle color filtering
  const finalQuery = await handleColorFilter(colors as string, baseQuery);

  // If no products found with color filter
  if (finalQuery === null) {
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

  // Fetch products with pagination
  const products = await Product.find(finalQuery)
    .sort(sortOption)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate("categories")
    .populate("variants")
    .populate("reviews");

  const total = await Product.countDocuments(finalQuery);

  res.status(200).json({
    success: true,
    products,
    count: products.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
  });
};
