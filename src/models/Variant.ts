import mongoose, { Document } from "mongoose";

interface Option {
  name: string;
  value: string;
  type: "color" | "size" | "material" | "style";
  displayName?: string; // For frontend display
  hexCode?: string; // For color variants
  image?: string; // For color/material swatches
}

interface PriceAdjustment {
  type: "fixed" | "percentage";
  value: number;
}

interface Inventory {
  inStock: number;
  lowStockThreshold: number;
  backorderable: boolean;
  preorderable: boolean;
  expectedRestockDate?: Date;
}

interface VariantCombination {
  id: string; // e.g., "black-large" or "red-small"
  isActive: boolean;
  isDefault: boolean;
}

export interface Variant extends Document {
  product: mongoose.Types.ObjectId;
  name: string;
  combination: VariantCombination;
  options: Option[];
  basePrice: number;
  priceAdjustments: PriceAdjustment[];
  inventory: Inventory;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  isActive: boolean;
  metadata?: {
    [key: string]: any;
  };
}

const variantSchema = new mongoose.Schema<Variant>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    name: {
      type: String,
      required: [true, "Variant name is required"],
    },
    combination: {
      id: String,
      isActive: Boolean,
      isDefault: Boolean,
    },
    options: [
      {
        name: {
          type: String,
          required: [true, "Option name is required"],
        },
        value: {
          type: String,
          required: [true, "Option value is required"],
        },
        type: {
          type: String,
          enum: ["color", "size", "material", "style"],
          required: [true, "Option type is required"],
        },
        displayName: String,
        hexCode: String,
        image: String,
      },
    ],
    basePrice: {
      type: Number,
      required: [true, "Variant base price is required"],
    },
    priceAdjustments: [
      {
        type: {
          type: String,
          enum: ["fixed", "percentage"],
          required: [true, "Price adjustment type is required"],
        },
        value: {
          type: Number,
          required: [true, "Price adjustment value is required"],
        },
      },
    ],
    inventory: {
      inStock: {
        type: Number,
        required: [true, "Inventory inStock is required"],
      },
      lowStockThreshold: {
        type: Number,
        required: [true, "Inventory lowStockThreshold is required"],
      },
      backorderable: {
        type: Boolean,
        required: [true, "Inventory backorderable is required"],
      },
      preorderable: {
        type: Boolean,
        required: [true, "Inventory preorderable is required"],
      },
      expectedRestockDate: Date,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
    },
    barcode: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    images: [String],
    isActive: {
      type: Boolean,
      required: [true, "Variant isActive is required"],
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const Variant = mongoose.model("Variant", variantSchema);
