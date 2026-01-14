import mongoose, { Schema, type Document, HydratedDocument, Model } from "mongoose"
import * as bcrypt from 'bcrypt';
import { IBusinessRole, IUser, IUserMethods } from "../interfaces/user.types"

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
export type UserModel = Model<IUser, {}, IUserMethods>;

const BusinessRoleSchema = new Schema<IBusinessRole>({
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  role: { type: String, enum: ["super-admin","admin", "member"], default: "member" },
}, { _id: false });


const UserSchema: Schema = new Schema<IUser, UserModel, IUserMethods> (
{
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['super-admin', 'user'], 
      default: "user",
      required: true,
    },
    fname: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lname: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    occupation: {
      type: String,
      default: null,
    },
    serviceType: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
   businesses: { type: [BusinessRoleSchema], default: [] },
   conversations: [{ type: Schema.Types.ObjectId, ref: "Conversation" }],
    onboardingComplete: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  },
);

// Indexes
// UserSchema.index({ email: 1 })
// UserSchema.index({ role: 1 })

// Hash password before saving
UserSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password as string, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password)
}

// Method to get full name
UserSchema.methods.getFullName = function (): string {
  return `${this.fname} ${this.lname}`
}

// Create and export model
export const User = mongoose.model<IUser, UserModel>('User', UserSchema);