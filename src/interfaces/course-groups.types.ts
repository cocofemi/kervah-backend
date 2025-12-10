import { Types } from "mongoose";

export interface ICourseGroup {
  id: Types.ObjectId;
  name: string;
  description: string;
  courses: Types.ObjectId[];
  createdAt:Date;
  updatedAt:Date
}