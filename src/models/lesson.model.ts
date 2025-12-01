import mongoose, { Schema, type Document } from "mongoose"
import { ILesson } from "../interfaces/lessons.types"

const LessonSchema: Schema = new Schema<ILesson> (
    {
        title: {
            type: String,
            required: [true, "Lesson title is required"],
            trim: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        videoUrl: {
            type: String,
        },
        textContent: {
            type: String,
        },
        assessments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assessment',
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {timestamps: true}
)

// Create and export model
export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);