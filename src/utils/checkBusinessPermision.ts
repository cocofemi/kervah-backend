// utils/checkBusinessPermission.ts
import { Business } from "../models/business.model";

/**
 * Checks if a user has one of the allowed roles in a business.
 * Throws an error if unauthorized.
 */
export const checkBusinessPermission = async (
  businessId: string,
  userId: string,
  allowedRoles: string[] = ["admin"]
) => {
  const business = await Business.findById(businessId);
  if (!business) throw new Error("Business not found");

const member = business.members?.find(
  (m) =>
    String(typeof m.user === "object" && "_id" in m.user ? m.user._id : m.user) ===
    String(userId)
);

  if (!member) throw new Error("User is not a member of this business");

  if (!allowedRoles.includes(member.role)) {
    throw new Error("You do not have permission to perform this action");
  }

  return business;
};
