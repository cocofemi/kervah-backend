import { NotificationType, Notification } from "../models/notification.model";
import { getIO } from "../lib/socket";

interface PushNotificationInput {
  userId: string;
  businessId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export async function pushNotification(input:PushNotificationInput) {
    const { userId, businessId, type, title, message, data = {} } = input;

    const notification = await Notification.create({
        user:userId,
        business: businessId,
        type,
        title,
        message,
        data,
    });

    const payload = {
        id: notification._id.toString(),
        type,
        title,
        message,
        data,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
    };

    getIO().to(userId.toString()).emit("notification", payload);
    return notification;
}