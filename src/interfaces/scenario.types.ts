import mongoose from "mongoose";

export interface IScenario {
  id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  instructions: string;
  rubric: RubricCriterion[];
  maxScore: number;
  maxAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RubricCriterion {
  id: string;
  description: string;
  weight: number; // 0–1, should sum ~1.0
}

export interface IScenarioSubmission {
  scenarioId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  answer: string;
  aiScore: number;
  aiFeedback: string;
  attemptNumber?: number;
  createdAt: Date;
}
