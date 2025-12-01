import { Notification } from "../../models/notification.model";
import { INotification } from "../../interfaces/notification.types";
import { checkBusinessPermission } from "../../utils/checkBusinessPermision";

interface Context {
    auth: boolean
    user: string
}

export const notificationResolver = {
    Query: {
        notificationsForUser: async (_: any, { userId }: any, ctx: Context) => {
            if(!ctx.auth) throw new Error("Unauthorized");
            if (ctx.user != userId) throw new Error("You can only view your own notifications");
            return await Notification.find({ user: userId })
                .sort({ createdAt: -1 })
        },

        notificationsForBusiness: async (_: any, { businessId }: any, ctx: Context) => {
            if(!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            await checkBusinessPermission(businessId, ctx.user, ["admin"]);
            return await Notification.find({ business: businessId })
                .sort({ createdAt: -1 })
        },
    },
    Mutation: {
        createNotification: async (_: any, { input }: any, ctx: Context):Promise<INotification | null> => {
            if(!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const { userId, businessId, title, message, type } = input;

            // Admins can post business-wide notifications
            if (businessId) {
                await checkBusinessPermission(businessId, ctx.user, ["admin"]);
            }

            const notif = await Notification.create({
                user: userId,
                business: businessId,
                title,
                message,
                type,
            });
            return notif;
    //   // 🔔 (Optional) Emit realtime event if using Socket.IO
    //   if (context.io && businessId) {
    //     context.io.emit(`notification:${businessId}`, notif);
    //   }  
        },
        markNotificationRead: async (_: any, { notificationId }: any, ctx: Context):Promise<INotification | null> => {
            const notif = await Notification.findById(notificationId);
            if (!notif) throw new Error("Notification not found");
                console.log("User", notif);
            // User can only mark their own notifications
            if (notif.user?.toString() !== ctx.user.toString()) {
                throw new Error("Not authorized to modify this notification");
            }

            notif.isRead = true;
            await notif.save();
            return notif;
        },

        markAllNotificationsRead: async (_: any, __: any, ctx: Context) => {
            const userId = ctx.user;
            if (!userId) throw new Error("Not authenticated");

            await Notification.updateMany(
            { user: userId, isRead: false },
            { $set: { isRead: true } }
            );

            return true;
        },
    }
}