// models/billingHistory.model.ts
import { Schema, model } from "mongoose";
import { IBilling } from "../interfaces/billing.types";

const BillingHistorySchema = new Schema<IBilling>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: false,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },

    stripeInvoiceId: { type: String },
    stripePaymentIntentId: { type: String },

    quantity: {type: Number},

    amount: { type: Number, required: true }, // cents
    currency: { type: String, default: "usd" },

    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    description: { type: String },
    processedBilling: {type: Boolean, default: false},

    status: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "paid",
    },
  },
  { timestamps: true }
);

export const BillingHistory = model<IBilling>("BillingHistory", BillingHistorySchema);
