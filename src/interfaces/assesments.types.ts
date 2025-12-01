import { ICourse } from "./course.types";
import { IUser } from "./user.types";
import mongoose, { Types } from "mongoose";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

export interface IAssessment {
  // questionType: QuestionType;
  question: string;
  options: string[];         
  correctAnswer: number;
  // points?: number;
  explanation?: string; 
  lessonId:Types.ObjectId;   
  createdBy: Types.ObjectId;  
  createdAt: Date
  updatedAt: Date
}