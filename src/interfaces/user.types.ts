import mongoose, { Schema, Document, Types, Model, HydratedDocument } from "mongoose";
import { IConversation } from "./conversation.types";

// GraphQL Types for User
export interface UserInput {
  email: string
  password: string
  fname: string
  lname: string
  avatar?: string
  occupation:string
  serviceType:string
  bio?:string
  role?: "super-admin" | "admin" | "member"
}

export interface IUser {
    id?: Types.ObjectId
    email: string
    password: string
    role: 'super-admin'| "user"
    fname: string
    lname: string
    avatar?: string
    occupation:string
    serviceType:string
    bio:string
    emailVerified: boolean
    businesses: IBusinessRole[]
    conversations: IConversation[]
    createdAt: Date
    updatedAt: Date
    comparePassword(password: string): Promise<boolean>
    // getFullName(): string
}

export interface IBusinessRole {
    business: Types.ObjectId;
    role: string
}

export interface UserResponse {
  id?: string
  email: string
  fname: string
  lname: string
  avatar?: string
  occupation:string
  serviceType:string
  role: string
  bio?:string
  businesses: IBusinessRole[]
  emailVerified: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthResponse {
  token: string
  user: UserResponse
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

