import mongoose from "mongoose";
import { ICourse } from "./course.types"
import { IUser } from "./user.types"


export interface ILesson {
    title:string
    courseId:ICourse
    videoUrl:string
    textContent:string 
    assessments: mongoose.Types.ObjectId[]
    createdBy: IUser
    createdAt:Date
    updatedAt:Date
}