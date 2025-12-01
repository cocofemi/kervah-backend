import { IBusiness } from "./business.types"

export interface IBusinessRole {
    business: IBusiness
    role: 'super-admin' |'admin' | 'member'
    createdAt: Date
    updatedAt: Date
}

export interface businessRoleResponse {
    id?:string
    business: IBusiness
    role: 'super-admin' |'admin' | 'member'
    createdAt: Date
    updatedAt: Date
}

export interface IBusinessRole {
    businessRole: businessRoleResponse
}