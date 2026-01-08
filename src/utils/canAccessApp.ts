import { IBusiness } from "../interfaces/business.types";
import { Business } from "../models/business.model";

export function canAccessApp(business:IBusiness) {
  // Paid users
  if (business.subscriptionStatus === "active") return true;

  // Free trial users
  if (
    business.subscriptionStatus === "trialing" &&
    business.trialEndsAt &&
    business.trialEndsAt > new Date()
  ) {
    return true;
  }

  return false;
}
