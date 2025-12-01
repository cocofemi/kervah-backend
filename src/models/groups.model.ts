import mongoose, { Schema, type Document } from "mongoose"
import { IGroup } from "../interfaces/groups.types"

const GroupSchema = new Schema<IGroup>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true },
    description: {type:String, required:true},
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    retakeIntervalMonths: { type: Number, default: 12 },
  },
  { timestamps: true }
);

// Create and export model
export const Group = mongoose.model<IGroup>("Group", GroupSchema);
