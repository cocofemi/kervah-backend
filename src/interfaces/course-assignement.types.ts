import { IBusiness } from "./business.types"
import { ICourse } from "./course.types"
import { IUser } from "./user.types"

export interface IBusinessCourse {
  business: IBusiness
  course: ICourse
  assignedBy: IUser
  assignedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface businessCourseResponse {
  id?:string
  business: IBusiness
  course: ICourse
  assignedBy: IUser
  assignedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface IBusinessCourseResponse {
    businessCourse: businessCourseResponse
}