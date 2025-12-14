import mongoose, { Schema, Document, Types } from "mongoose";
import { IPolicyDocument } from "../interfaces/policy.types";

const PolicyDocumentSchema = new Schema<IPolicyDocument>(
  {
    documentUrl: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required:false },
    fileType: {type: String, required: false},
    fileSize: {type: String, required: false},
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
  },
  { timestamps: true }
);

export const PolicyDocument = mongoose.model<IPolicyDocument>("Policy", PolicyDocumentSchema);