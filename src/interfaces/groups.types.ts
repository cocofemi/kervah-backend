import { Types } from "mongoose";

export interface IGroup{
  business: Types.ObjectId;
  name: string;
  description?: string;
  members: Types.ObjectId[];
  courses: Types.ObjectId[];
  retakeIntervalMonths: number; // e.g., 12 = yearly retake
  createdAt: Date;
  updatedAt: Date;
    
}
