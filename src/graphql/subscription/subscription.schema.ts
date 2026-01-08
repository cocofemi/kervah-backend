export const subscriptionTypeDefs = `
enum SubscriptionPlan {
  free
  pro
}

enum SubscriptionStatus {
  active
  trialing
  canceled
  past_due
  incomplete
}

type CheckoutUrl {
    sessionUrl: String!
}

type Subscription {
  id: ID!
  businessId: ID!
  stripeCustomerId: String!
  stripeSubscriptionId: String!
  plan: SubscriptionPlan!
  amount: Int!
  currency: String!
  interval: String!
  status: SubscriptionStatus!
  currentPeriodStart: String
  currentPeriodEnd: String
  cancelAtPeriodEnd: Boolean!
  createdAt: String!
  updatedAt: String!
}

type BillingRecord {
  id: ID!
  businessId: ID!
  subscriptionId: ID!
  stripeInvoiceId: String
  stripePaymentIntentId: String
  quantity: Int!
  amount: Int!
  currency: String!
  periodStart: String!
  periodEnd: String!
  description: String
  status: String!
  createdAt: String!
}

type Query {
  currentSubscription(businessId: ID!): Subscription
  billingHistory(businessId: ID!, limit: Int = 20, offset: Int = 0): [BillingRecord!]!
}



type Mutation {
  createCheckoutSession(
    businessId: ID!
    plan: SubscriptionPlan!
    interval: String! # "monthly" or "annually",
    members: Int!
  ): CheckoutUrl! # return checkout URL

  updateSubscriptionSeats(businessId: ID!, members: Int!): Boolean!
  cancelSubscription(businessId: ID!): Boolean!
  reactivateSubscription(businessId: ID!): Boolean!
}

`