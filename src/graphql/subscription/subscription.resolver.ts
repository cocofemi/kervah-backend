import { Types } from "mongoose";
import { stripe } from "../../lib/stripe";
import { Business } from "../../models/business.model";
import { checkBusinessPermission } from "../../utils/checkBusinessPermision";
import { Subscription } from "../../models/subscription.model";
import { BillingHistory } from "../../models/billing.model";
import { getPriceId } from "../../utils/price_plan";
import { pushNotification } from "../../services/notificationService";
import { NotificationType } from "../../models/notification.model";

interface Context { 
    auth: boolean
    user: string
}

export const subscriptionResolver = {
    Query: {
        currentSubscription: async (_:any, {businessId}: {businessId: string}, ctx: Context) => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user;
            await checkBusinessPermission(businessId.toString(), currentUserId, ["admin", "super-admin"])

            const business = await Business.findOne({
                _id: new Types.ObjectId(businessId),
                ownerId: new Types.ObjectId(currentUserId),
            });
            if (!business) throw new Error("Business not found");

            return Subscription.findOne({ businessId }).sort({ createdAt: -1 });
        },
        billingHistory: async (_: any, { businessId, limit, offset }: {businessId: string, limit: number, offset: number}, ctx: any) => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user;
            await checkBusinessPermission(businessId.toString(), currentUserId, ["admin", "super-admin"])

            const business = await Business.findOne({
                _id: new Types.ObjectId(businessId),
                ownerId: new Types.ObjectId(currentUserId),
            });
            if (!business) throw new Error("Business not found");
            
            return BillingHistory.find({ businessId })
                .sort({ billingDate: -1 })
                .skip(offset)
                .limit(limit);
            },
        },

        Mutation: {
            createCheckoutSession: async(_:any, { businessId, plan, interval, members }: any, ctx:Context) => {
                 if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
                const currentUserId = ctx.user;
                await checkBusinessPermission(businessId.toString(), currentUserId, ["admin", "super-admin"])

                const business = await Business.findOne({
                    _id: new Types.ObjectId(businessId),
                    ownerId: new Types.ObjectId(currentUserId),
                });

                if (!business) throw new Error("Business not found");

                if (plan === "free") {
                    business.subscriptionPlan = "free"
                    business.subscriptionStatus = "trialing"
                    business.subscribedUsers = 2
                    business.trialEndsAt = new Date(
                        Date.now() + 14 * 24 * 60 * 60 * 1000
                    );
                    await business.save()

                    await pushNotification({
                        userId: business.ownerId?.toString(),
                        businessId,
                        type: NotificationType.SUBSCRIPTION_SUCCESS,
                        title: "Subscription",
                        message: `Welcome aboard 🎉. You are subscribed to the 14 days free plan.`,
                        data: {
                            userId: ctx?.user,
                            businessId,
                        },
                    });
                    return { sessionUrl:"free" }
                    
                }

                const priceId = getPriceId(plan, interval);

                const existingSub = await Subscription.findOne({
                    businessId: business._id,
                });

                if (existingSub && existingSub.status === "active") {
                    throw new Error("Subscription already exists. Use updateSubscription.");
                }

                let stripeCustomerId = existingSub?.stripeCustomerId;

                if (!stripeCustomerId) {
                    const customer = await stripe.customers.create({
                        name: business.name,
                        metadata: {
                        businessId: business._id.toString(),
                        ownerId: business.ownerId?.toString() || "",
                        plan
                        },
                    });

                    stripeCustomerId = customer.id;
                }

                const session = await stripe.checkout.sessions.create({
                    mode: "subscription",
                    customer: stripeCustomerId,
                    metadata: {
                        businessId: business._id.toString(),
                        ownerId: business.ownerId?.toString() || "",
                        interval,
                        plan
                    },
                    line_items: [{ price: priceId, quantity: members }],
                    success_url: `${process.env.SUCCESS_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.CANCEL_URL}`,
                });

                return { sessionUrl:session.url }
            },

            updateSubscriptionSeats: async (_: any,{ businessId, members }: any, ctx: Context) => {
                if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

                await checkBusinessPermission(businessId.toString(),
                    ctx.user,["admin", "super-admin"]);

                const business = await Business.findOne({
                    _id: new Types.ObjectId(businessId),
                    ownerId: new Types.ObjectId(ctx?.user),
                });

                if (!business) throw new Error("Business not found");

                const sub = await Subscription.findOne({ businessId });
                if (!sub) throw new Error("No active subscription");

                //get current number of seats(subscriptions)
                const currentSeats = sub.seats;
                const newSeats = currentSeats + members;

                if (newSeats < 1) {
                    throw new Error("Subscription must have at least 1 seat");
                }

                // Retrieve subscription from Stripe
                const stripeSub = await stripe.subscriptions.retrieve(
                    sub.stripeSubscriptionId
                );

                console.log("We got here", stripeSub.items.data[0].id)

                const itemId = stripeSub.items.data[0].id;

                await stripe.subscriptions.update(sub.stripeSubscriptionId, {
                    metadata: {
                        businessId: business._id.toString(),
                        ownerId: business.ownerId?.toString() || "",
                    },
                });

                // Update quantity (THIS triggers customer.subscription.updated)
                await stripe.subscriptionItems.update(itemId, {
                    quantity: newSeats,
                    proration_behavior: "create_prorations",
                });

                return true 
            },

            reactivateSubscription: async (_: any, { businessId }: any, ctx: Context) => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

            await checkBusinessPermission(businessId, ctx.user, ["admin", "super-admin"]);

            const sub = await Subscription.findOne({ businessId });
            if (!sub) throw new Error("No subscription found");

            if (!sub.cancelAtPeriodEnd) {
                throw new Error("Subscription is already active");
            }

            await stripe.subscriptions.update(sub.stripeSubscriptionId, {
                cancel_at_period_end: false,
            });

            return true;
            },

            cancelSubscription: async (_: any, { businessId }: {businessId: string}, ctx: Context) => {
                if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
                const currentUserId = ctx.user;
                await checkBusinessPermission(businessId.toString(), currentUserId, ["admin", "super-admin"])

                const sub = await Subscription.findOne({ businessId });
                if (!sub) throw new Error("No active subscription");

                await stripe.subscriptions.update(sub.stripeSubscriptionId, {
                    cancel_at_period_end: true,
                });

                sub.cancelAtPeriodEnd = true;
                await sub.save();

                return true;
            },
        },

        Subscription: {
            id: (root: any) => root._id.toString(),
            businessId: (root: any) => root.businessId.toString(),
        },

        BillingRecord: {
            id: (root: any) => root._id.toString(),
            businessId: (root: any) => root.businessId.toString(),
            subscriptionId: (root: any) => root.subscriptionId.toString(),
        },
}

