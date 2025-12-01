import mongoose, { Schema, type Document } from "mongoose"
import { IResult } from "../interfaces/result.types"

export interface IResultModel extends IResult, Document {}

const ResultSchema: Schema = new Schema<IResult> (
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        assessmentScore: {
            type: Number,
            required: [true, 'Assessment score is required']
        },
        scenarioScore: {
            type: Number,
            required: [true, 'Scenario score is required']
        }
    },
    {timestamps: true},
)

// Create and export model
export const Result = mongoose.model<IResultModel>('Result', ResultSchema);