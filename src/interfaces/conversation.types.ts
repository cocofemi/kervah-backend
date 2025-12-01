import { Types } from "mongoose";

export interface IConversation {
    userId: Types.ObjectId;
    title: string;
    messages: [Messages];
    createdAt: Date;
    updatedAt: Date;
}

interface Messages {
    role: string;
    content:string;
    timestamp: Date
}