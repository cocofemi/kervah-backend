import { Types } from "mongoose";

export interface IBilling {
    businessId: Types.ObjectId | string;
    subscriptionId: Types.ObjectId | string;
    stripeInvoiceId: string;
    stripePaymentIntentId: string;
    quantity: number;
    amount: number;
    currency: string;
    description: string;
    processedBilling: boolean;
    status: string;
    periodStart: Date;
    periodEnd: Date;
}