// models/CourseProgress.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { IBusiness } from "./business.types";
import { IUser } from "./user.types";
import { ICourse } from "./course.types";
import { ILesson } from "./lessons.types";

export interface ICourseProgress  {
  user: Types.ObjectId | IUser;
  business: Types.ObjectId | IBusiness;
  // group: Types.ObjectId;
  course: Types.ObjectId ;
  status:
    | "not_started"
    | "started"
    | "completed"
    | "passed"
    | "failed"
    | "no_completion"
    | "archive"
  score?: number;
  startedAt?: Date;      
  completedAt?: Date; 
  lastLessonId: Types.ObjectId;     
  completedLessons: Types.ObjectId[] 
  percentage: Number;    
  lastUpdated: Date;
  createdAt: Date
  updatedAt: Date
}
