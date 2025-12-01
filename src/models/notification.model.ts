import mongoose, { Schema } from "mongoose";
import { INotification } from "../interfaces/notification.types";

export enum NotificationType {
  INVITE_ACCEPTED = "INVITE_ACCEPTED",
  COURSE_COMPLETED = "COURSE_COMPLETED",
  COURSE_PASSED = "COURSE_PASSED",
  COURSE_FAILED = "COURSE_FAILED",
  CERTIFICATE_ISSUED = "CERTIFICATE_ISSUED",
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    business: { type: Schema.Types.ObjectId, ref: "Business" },
    title: { type: String, required: true },
    message: { type: String, required: true },
   type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);