import mongoose, { Schema, model, models } from "mongoose";
import { ISimulatedScenario } from "../interfaces/simulated-scenarios.types";

const SimulatedScenarioSchema = new Schema<ISimulatedScenario>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SimulatedScenarioSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export const SimulatedScenario = mongoose.model<ISimulatedScenario>("SimulatedScenario", SimulatedScenarioSchema);