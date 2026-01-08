import { Types } from "mongoose"

export interface ISubscription{
    businessId: Types.ObjectId | string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    plan: string;
    amount: number;
    currency: string;
    interval: string;
    status: string
    seats: number;
    processedSubscription: boolean;
    canceledAt?: Date | null;
    cancelAtPeriodEnd?: Boolean;
    currentPeriodEnd?: Date;
    currentPeriodStart?: Date;
}