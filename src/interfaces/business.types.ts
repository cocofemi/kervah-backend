import mongoose, { Schema, Document, Types } from "mongoose";
import { IBusinessCourse } from "./course-assignement.types"
import { IUser } from "./user.types"

export interface IBusiness {
    // _id?: mongoose.Types.ObjectId;
    name: string
    phone: string
    address: string
    ownerId: Types.ObjectId | string
    logo?: string | undefined
    serviceType: "CH" | "SA" | "BOTH"
    members: IMember[]
    // groups: [IGroup]
    subscribedUsers: number;
    assignedCourses: Types.ObjectId[];
    subscriptionPlan?: string | undefined
    subscriptionStatus?: string | undefined
    trialEndsAt?: Date | null;
    createdAt: Date
    updatedAt: Date
}

export interface IMember {
    user: Types.ObjectId | string
    role:string
    joined?:Date
}
