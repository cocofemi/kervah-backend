import mongoose, { Schema } from "mongoose";
import { IScenarioSubmission } from "../interfaces/scenario.types";

const ScenarioSubmissionSchema = new Schema<IScenarioSubmission>(
  {
    scenarioId: { type: Schema.Types.ObjectId, ref: "Scenario", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    answer: { type: String, required: true },
    aiScore: { type: Number, required: true },
    aiFeedback: { type: String, required: true },
    attemptNumber: { type: Number, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ScenarioSubmission = mongoose.model<IScenarioSubmission>('ScenarioSubmission', ScenarioSubmissionSchema);
