import mongoose, { Schema, Document, Types } from "mongoose";
import { ICertificate } from "../interfaces/certificate.types";

const CertificateSchema = new Schema<ICertificate>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    // group: { type: Schema.Types.ObjectId, ref: "Group" },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    issueDate: { type: Date, default: Date.now },
    certificateId: { type: String, unique: true, required: true },
    score: Number,
    status: { type: String, enum: ["issued", "revoked"], default: "issued" },
    downloadUrl: String,
  },
  { timestamps: true }
);

export const Certificate = mongoose.model<ICertificate>("Certificate", CertificateSchema);