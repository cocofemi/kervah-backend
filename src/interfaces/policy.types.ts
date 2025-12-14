import { Types } from "mongoose";

export interface IPolicyDocument {
    documentUrl: string;
    name:string;
    category:string;
    businessId: Types.ObjectId;
    description: string;
    fileType: string;
    fileSize:string;
    uploadedBy: Types.ObjectId;
    createdAt: Date;
    updatedAte: Date;
}