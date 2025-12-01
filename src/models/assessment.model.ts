import mongoose, { Schema, type Document } from "mongoose"
import { IAssessment } from "../interfaces/assesments.types"

const AssessmentSchema: Schema = new Schema<IAssessment> (
    {
        // questionType: {
        // type: String,
        // enum: ["MCQ", "TRUE_FALSE"],
        // required: true,
        // },
        question: { 
            type: String, 
            required: true 
        },
        options: [String],
        correctAnswer: {
            type: Number,
            required: true,
        },
        // points: { 
        //     type: Number, 
        //     default: 1 
        // },
        explanation: {
            type:String,
        },
        lessonId: { 
            type: Schema.Types.ObjectId, 
            ref: "Lesson", 
            required: true
        },
        createdBy: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true
        },
    },
    {timestamps: true},
)

// Create and export model
export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);