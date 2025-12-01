import mongoose, { Schema, type Document } from "mongoose"
import { ICourse } from "../interfaces/course.types"

const CourseSchema: Schema = new Schema<ICourse> (
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Description  is required"],
        },
        category: {
            type: String,
            required: [true, "Category  is required"],
        },
        thumbnail: {
            type: String,
            default: null
        },
        duration: {
            type: String,
            required: [true, "duration  is required"],
        },
        lessons: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
        }],
        scenarios: {
             type: mongoose.Schema.Types.ObjectId,
            ref: 'Scenario',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        publish: {
            type: Boolean,
            default: false
        },
        archive: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true},
)

// Create and export model
export const Course = mongoose.model<ICourse>('Course', CourseSchema);