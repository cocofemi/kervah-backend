import { Schema, model, models } from "mongoose";
import { IDailyTriviaAnswers } from "../interfaces/daily-trivia-answers.types";

const DailyTriviaSchemaAnswers = new Schema<IDailyTriviaAnswers>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    triviaId: { type: String, required: true },
    answeredAt: { type: Date, required: true },
    isCorrect: {type: Boolean, required: true}
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DailyTriviaAnswers = models.DailyTriviaAnswers || model<IDailyTriviaAnswers>("DailyTriviaAnswers", DailyTriviaSchemaAnswers);
