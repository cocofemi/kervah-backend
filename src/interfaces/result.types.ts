import { ICourse } from "./course.types";
import { IUser } from "./user.types";

export interface IResult {
    userId: IUser;
    courseId: ICourse;
    assessmentScore: number;
    scenarioScore: number;
    createdAt: Date
    updatedAt: Date 
}

export interface resultResponse {
    id?:string
    userId: IUser;
    courseId: ICourse;
    assessmentScore: number;
    scenarioScore: number;
    createdAt: Date
    updatedAt: Date 
}

export interface IResultResponse {
    result: resultResponse
}