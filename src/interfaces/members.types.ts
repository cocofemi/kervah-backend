import { IBusiness } from "./business.types";
import { IUser } from "./user.types";

export interface Members {
    businessId: IBusiness
    userId: IUser
    role: "admin" | "member"
    joinedAt: Date
    createdAt: Date
    updatedAt: Date
}

export interface membersResponse {
    id?: string
    businessId: IBusiness
    userId: IUser
    role: "admin" | "member"
    joinedAt: Date
    createdAt: Date
    updatedAt: Date
}

export interface IMembersResponse {
    members: membersResponse
}