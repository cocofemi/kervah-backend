import { Types } from "mongoose";

export interface ISimulatedScenario {
    user: Types.ObjectId,
    business: Types.ObjectId,
    score: number,  
    total: number,      
    createdAt: Date,
    updatedAt: Date
}