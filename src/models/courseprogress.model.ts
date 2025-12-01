import mongoose, { Schema, type Document } from "mongoose"
import { ICourseProgress } from "../interfaces/courseprogress.types";

const CourseProgressSchema = new Schema<ICourseProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    // group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["not_started", "started", "completed", "passed", "failed", "archive"],
      default: "not_started",
    },
    score: Number,
    lastLessonId: {type: Schema.Types.ObjectId, ref: "Lesson", default: null },
    completedLessons: [{type: Schema.Types.ObjectId, ref: "Lesson", default: [] }],
    percentage: {type: Number, default: 0},
    startedAt: { type: Date, default: null},  
    completedAt: { type: Date },
    lastUpdated: { type: Date, default: Date.now },     
  },
  { timestamps: true }
);

export const CourseProgress = mongoose.model<ICourseProgress>(
  "CourseProgress",
  CourseProgressSchema
);
