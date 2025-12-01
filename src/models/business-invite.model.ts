import mongoose, { Schema } from "mongoose";
import { IBusinessInvite } from "../interfaces/business-invite.types";

const BusinessInviteSchema = new Schema<IBusinessInvite>(
  {
    email: { type: String, required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "accepted", "expired", "revoked"], default: "pending" },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const BusinessInvite = mongoose.model<IBusinessInvite>(
  "BusinessInvite",
  BusinessInviteSchema
);