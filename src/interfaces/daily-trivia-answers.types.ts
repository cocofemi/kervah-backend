import { Types } from "mongoose";

export interface IDailyTriviaAnswers {
  triviaId: string, 
  user: Types.ObjectId,
  answeredAt: Date,
  isCorrect: boolean
}