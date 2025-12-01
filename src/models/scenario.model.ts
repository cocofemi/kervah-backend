import mongoose, { Schema, type Document } from "mongoose"
import { IScenario, RubricCriterion } from "../interfaces/scenario.types"

const RubricCriterionSchema = new Schema<RubricCriterion>(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    weight: { type: Number, required: true },
  },
  { _id: false }
);

const ScenarioSchema = new Schema<IScenario>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    rubric: { type: [RubricCriterionSchema], required: true },
    maxScore: { type: Number, required: true, default: 50 },
    // maxAttempts: { type: Number, default: 3 },
  },
  { timestamps: true }
);


// Create and export model
export const Scenario = mongoose.model<IScenario>('Scenario', ScenarioSchema);