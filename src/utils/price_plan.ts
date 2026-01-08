export const STRIPE_PRICES = {
   pro: {
    monthly: `${process.env.STRIPE_PRO_MONTHLY}`,
    annual: `${process.env.STRIPE_PRO_ANNUALLY}`,
  }
} as const;

export function getPriceId(
  plan: keyof typeof STRIPE_PRICES,
  interval: "monthly" | "annual"
) {
  const priceId = STRIPE_PRICES[plan]?.[interval];
  if (!priceId) throw new Error("Invalid plan or interval");
  return priceId;
}
