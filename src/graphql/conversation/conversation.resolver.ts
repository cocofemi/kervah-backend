import { Conversation } from "../../models/conversations.model";
import { User } from "../../models/user.model";

interface Context {
    auth: Boolean;
    user?: {id: string};
}

export const conversationResolver = {
    Query :{
        getConversation: async (_:any, { conversationId }: {conversationId: string}, ctx: Context ) => {
            if (!ctx.auth) throw new Error("Unauthorized");
            return Conversation.findById(conversationId);
        },
        getUserConversations: async (_: any, __:any, ctx:Context) => {
            if (!ctx.auth || !ctx?.user) throw new Error("Unauthorized");
            return Conversation.find({userId: ctx?.user }).sort({ updatedAt: -1 });
        }
    },

    Mutation :{ 
        createConversation: async (_: any, { firstMessage }:any, ctx: Context) => {
            if (!ctx.auth || !ctx?.user) throw new Error("Unauthorized");
            const title = firstMessage.slice(0, 60); 

            const conversation = await Conversation.create({
                userId: ctx?.user,
                title,
                messages: [
                { role: "user", content: firstMessage }
                ]
            });

            // Add conversation to user
            await User.findByIdAndUpdate(ctx?.user, {
                $push: { conversations: conversation._id }
            });

            return conversation;
        },
        appendMessage: async (_:any, { conversationId, role, content }: any, ctx:Context) => {
            if (!ctx.auth || !ctx?.user) throw new Error("Unauthorized");
            await Conversation.findByIdAndUpdate(conversationId, {
                $push: {
                messages: { role, content, timestamp: new Date() }
                },
                $set: { updatedAt: new Date() }
            });

            return true;
        },
        deleteConversation: async (_:any, { conversationId }: any, ctx:Context) => {
            if (!ctx.auth || !ctx?.user) throw new Error("Unauthorized");
            await Conversation.findByIdAndDelete(conversationId);
            return true;
        },
    }
}