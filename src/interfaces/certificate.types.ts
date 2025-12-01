import { Types } from "mongoose";

export interface ICertificate {
  user: Types.ObjectId;
  business: Types.ObjectId;
  course: Types.ObjectId;
  group?: Types.ObjectId;
  issueDate: Date;
  certificateId: string;  // unique serial number
  score?: number;
  status: "issued" | "revoked";
  downloadUrl?: string;   // optional link to PDF

}