import mongoose, { Schema, Types } from "mongoose";

export interface INotification  {
  user?: Types.ObjectId;        // for member notifications
  business?: Types.ObjectId;    // for business-wide notifications
  title: string;
  message: string;
  type: "system" | "course" | "certificate" | "group" | "business";
  data: Schema.Types.Mixed
  isRead: boolean;
  createdAt: Date;
}