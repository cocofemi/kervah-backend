import mongoose, { Schema, Types } from "mongoose";
import { ICourseGroup } from "../interfaces/course-groups.types";


const CourseGroupSchema = new Schema<ICourseGroup>(
    {
        name: { type: String, required: true },
        description: { type: String },
        courses: [{
            type: Types.ObjectId,
            ref: "Course",
            required: true,
        }],
    },
    { timestamps: true }
);


export const CourseGroup = mongoose.model<ICourseGroup>("CourseGroup", CourseGroupSchema);