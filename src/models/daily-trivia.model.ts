import { Schema, model, models } from "mongoose";
import { IDailyTrivia } from "../interfaces/daily-trivia.types";

const DailyTriviaSchema = new Schema<IDailyTrivia>(
  {
    id: { type: String, required: true, unique: true, index: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DailyTrivia = models.DailyTrivia || model<IDailyTrivia>("DailyTrivia", DailyTriviaSchema);
