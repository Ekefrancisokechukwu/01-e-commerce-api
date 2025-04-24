import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  refreshTokens: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Please provide a email"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => validator.isEmail(email),
        message: "Please provide valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
    },
    refreshTokens: [
      {
        type: String,
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add refresh token
userSchema.methods.addRefreshToken = async function (
  token: string
): Promise<void> {
  this.refreshTokens.push(token);
  await this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = async function (
  token: string
): Promise<void> {
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
  await this.save();
};

export const User = mongoose.model<IUser>("User", userSchema);
