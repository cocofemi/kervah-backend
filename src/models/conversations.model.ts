import mongoose, { Schema } from "mongoose";
import { IConversation } from "../interfaces/conversation.types";

const ConversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  title: { type: String, required: true },    // derived from first question
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Conversation = mongoose.model<IConversation>("Conversation", ConversationSchema);
