// models/subscription.model.ts
import { Schema, model, Types } from "mongoose";
import { ISubscription } from "../interfaces/subscription.types";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "incomplete";

const SubscriptionSchema = new Schema<ISubscription>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: false,
      index: true,
    },

    stripeCustomerId: { type: String, required: false },
    stripeSubscriptionId: { type: String, required: true, unique: true },

    plan: {
      type: String,
      enum: ["free", "pro"],
      required: false,
    },

    amount: { type: Number, required: false }, // cents
    currency: { type: String, default: "usd" },

    interval: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    seats: {type: Number},
    status: {
      type: String,
      enum: ["active", "trialing", "canceled", "past_due", "incomplete"],
      default: "active",
    },

    processedSubscription: {type: Boolean, default: false},

    currentPeriodStart: { type: Date, required: false },
    currentPeriodEnd: { type: Date, required: false },

    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription>("Subscription", SubscriptionSchema);
