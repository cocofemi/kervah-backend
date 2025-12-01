import { ICourse } from "./course.types";
import { IUser } from "./user.types";

export interface IEnrollment {
    userId: IUser
    courseId: ICourse
    progress: "started" | "inprogress" | "completed",
    createdAt: Date
    updatedAt: Date
}

export interface enrollmentResponse {
    id?:String
    userId: IUser
    courseId: ICourse
    progress: "started" | "inprogress" | "completed"
    createdAt: Date
    updatedAt: Date
}

export interface IEnrollmentResponse {
    enrollment: enrollmentResponse
}