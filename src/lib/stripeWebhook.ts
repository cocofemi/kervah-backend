// server.ts (or a dedicated routes/stripeWebhook.ts)

import Stripe from "stripe";
import { BillingHistory } from "../models/billing.model";
import { Business } from "../models/business.model";
import { Subscription } from "../models/subscription.model";
import { stripe } from "./stripe";
import { pushNotification } from "../services/notificationService";
import { NotificationType } from "../models/notification.model";

export const checkoutSession = async (event:Stripe.Event) => {
    console.log("Processing subscription....")
      const session = event.data.object as any;
      const subscriptionId = session?.subscription as string;

      const subExists = await Subscription.findOne({stripeSubscriptionId: subscriptionId, processedSubscription: true})

      if (subExists) return

      const customerId = session?.customer as string;

      const businessId = session?.metadata?.businessId;
      const ownerId = session?.metadata?.ownerId;
      const plan = session?.metadata?.plan;
      const interval = session?.metadata?.interval;

      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId) as any;

      const items = stripeSub.items.data

      const quantity = items.reduce(
        (sum:number, item) => sum + (item.quantity ?? 0),0);

      const totals = stripeSub.items.data.map(item => ({
            priceId: item.price.id,
            unitAmount: item.price.unit_amount ?? 0,
            quantity: item.quantity ?? 0,
            currency: item.price.currency,
            subtotal: (item.price.unit_amount ?? 0) * (item.quantity ?? 0),
       }));

        const totalAmount = totals.reduce(
        (sum:number, item) => sum + item.subtotal,
        0
        );

        const currency = totals[0]?.currency;

        const subDoc = await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            {
                businessId,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                plan,
                amount: totalAmount,
                currency,
                interval,
                status: stripeSub.status,
                processedSubscription: true,
                seats: quantity,
            },
            { upsert: true, new: true }
        );

      await BillingHistory.findOneAndUpdate(
        { subscriptionId: subDoc._id },
        {businessId},
        { upsert: true, new: true }
      )

      await Business.findByIdAndUpdate(businessId, {
        subscriptionPlan: plan,
        subscriptionStatus: "active",
        subscribedUsers: quantity,
      });

      await pushNotification({
          userId: ownerId,
          businessId: businessId,
          type: NotificationType.SUBSCRIPTION_SUCCESS,
          title: "Subscription",
          message: "Welcome aboard 🎉! Your subscription is now active and ready to use.",
          data: {
          businessId,
          },
      });
}

export const invoicePayment = async (event:Stripe.Event) => {
    console.log("Processing invoice payment...")
      const invoice = event.data.object as any;
      // const subscriptionId = invoice.subscription as string;
      const subscriptionId = invoice?.parent?.subscription_details?.subscription as string; 
      
      const billingDoc = await BillingHistory.findOne({stripeInvoiceId: invoice.id, processedBilling: true})

      if (billingDoc) return
    
      if (!subscriptionId) return;

      const periodStart = invoice.lines.data[0]?.period?.start;
      const periodEnd = invoice.lines.data[0]?.period?.end;

      const currentPeriodStart = periodStart
        ? new Date(periodStart * 1000)
        : null;

      const currentPeriodEnd = periodEnd
        ? new Date(periodEnd * 1000)
        : null;

    // Ensure subscription exists and get the document
    const subDoc = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId }, 
      { currentPeriodStart, currentPeriodEnd },  
      { upsert: true, new: true }            
    );

    const fullInvoice = await stripe.invoices.retrieve(invoice.id, {
      expand: ["lines.data.price"],
    });


      await BillingHistory.findOneAndUpdate(
        { subscriptionId: subDoc._id },
        {subscriptionId: subDoc._id,
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: invoice.payment_intent,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        quantity: fullInvoice?.lines?.data[0]?.quantity,
        periodStart: new Date(fullInvoice?.lines?.data?.[0]?.period.start * 1000),
        periodEnd: new Date(fullInvoice?.lines?.data?.[0]?.period.end * 1000),
        description: fullInvoice?.lines?.data[0]?.description,
        processedBilling: true,
        status: "paid"},
        { upsert: true, new: true }
      );

}

export const updateSubscription = async (event: Stripe.Event) => {
  console.log("Updating subscription....")
  const stripeSub = event.data.object as any;
  const subscriptionId = stripeSub.id;

  const subDoc = await Subscription.findOne({
    stripeSubscriptionId: subscriptionId,
  });

  const businessId = stripeSub?.metadata?.businessId;
  const ownerId = stripeSub?.metadata?.ownerId;

  if (!subDoc) return;

  //Always recompute seats from Stripe
  const seats = stripeSub.items?.data?.reduce(
    (sum: number, item: any) => sum + (item.quantity ?? 0),
    0
  ) ?? 0;

  subDoc.status = stripeSub.status;

  if (stripeSub.current_period_start) {
    subDoc.currentPeriodStart = new Date(
      stripeSub.current_period_start * 1000
    );
  }

  if (stripeSub.current_period_end) {
    subDoc.currentPeriodEnd = new Date(
      stripeSub.current_period_end * 1000
    );
  }

  subDoc.cancelAtPeriodEnd = stripeSub.cancel_at_period_end || false;
  subDoc.canceledAt = stripeSub.canceled_at
    ? new Date(stripeSub.canceled_at * 1000)
    : null;

  subDoc.seats = seats;

  await subDoc.save();

  //Mirror Stripe state into Business
  if (stripeSub.status === "active") {
    await Business.findByIdAndUpdate(subDoc.businessId, {
      subscriptionStatus: "active",
      subscribedUsers: seats,
    });
  }
      await pushNotification({
          userId: ownerId,
          businessId: businessId,
          type: NotificationType.UPGRADE_SUBSCRIPTION,
          title: "Subscription Upgrade",
          message: "Your subscription has been successfully upgraded.",
          data: {
          businessId,
          },
      });


  if (stripeSub.cancel_at_period_end) {
  // User has canceled, but still active until period end
  await Business.findByIdAndUpdate(subDoc.businessId, {
    subscriptionStatus: "canceling", // or "scheduled_cancel"
  });
    await pushNotification({
        userId: ownerId,
        businessId: businessId,
        type: NotificationType.CANCEL_SUBSCRIPTION,
        title: "Subscription Cancelled",
        message: `Your current subscription has been cancelled.`,
        data: {
        businessId,
        },
    });
}

if (stripeSub.status === "canceled") {
  // Subscription is fully ended
  await Business.findByIdAndUpdate(subDoc.businessId, {
    subscriptionStatus: "canceled",
    subscriptionPlan: "free",
    subscribedUsers: 0,
  });
}


  if (["past_due", "unpaid"].includes(stripeSub.status)) {
  await Business.findByIdAndUpdate(subDoc.businessId, {
    subscriptionStatus: stripeSub.status,
  });
}

};

