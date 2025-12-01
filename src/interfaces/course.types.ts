import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./user.types"

export interface ICourse {
    _id?: mongoose.Types.ObjectId
    title:string
    description:string
    category:string
    thumbnail:string
    duration:string
    lessons: mongoose.Types.ObjectId[]
    scenarios: mongoose.Types.ObjectId | null
    createdBy: Types.ObjectId | IUser
    publish: boolean
    archive: boolean
    createdAt:Date
    updatedAt:Date
}