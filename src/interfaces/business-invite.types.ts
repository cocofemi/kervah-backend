import { Types } from "mongoose";

export interface IBusinessInvite {
  email: string;
  business: Types.ObjectId;
  role: "admin" | "member";
  token: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  invitedBy: Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
}


