import mongoose, { Schema, type Document } from "mongoose"
import { IBusiness, IMember } from "../interfaces/business.types"

const MemberSchema = new Schema<IMember>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  role: { type: String, enum: ["super-admin", "admin", "member"], default: "member" },
  joined: {type: Date, default: Date.now}
}, { _id: false });

const BusinessSchema: Schema = new Schema<IBusiness> (
    {
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Number is required"],
      trim: true,
    },
    address: {type: String, requires: [true, "Address is required"]},
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    serviceType: {
      type: String,
      enum: ["CH", "SA", "BOTH"],
    },
    logo: {
        type: String,
        default: null
    },
    members: { type: [MemberSchema], default: [] },
    assignedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    subscriptionPlan: {
        type: String,
        enum: ["free", "starter", "standard", "premium"],
        default: "free"
    },
    subscriptionStatus: {
        type: Boolean,
        default: false
    }
    },
     {timestamps: true},
);

BusinessSchema.index(
  { ownerId: 1, name: 1 },
  { unique: true }
);



// Create and export model
export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);

