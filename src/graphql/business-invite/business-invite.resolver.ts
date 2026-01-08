import { BusinessInvite } from "../../models/business-invite.model";
import { Business } from "../../models/business.model";
import { User } from "../../models/user.model";
import { IBusinessInvite } from "../../interfaces/business-invite.types";
import { nanoid } from "nanoid";
import { checkBusinessPermission } from "../../utils/checkBusinessPermision";
import { pushNotification } from "../../services/notificationService";
import { NotificationType } from "../../models/notification.model";

interface Context {
   auth: boolean;
   user?:  string;
   subscriptionValid: boolean;
}

export const businessInviteResolver = {
    Query: {
        businessInvites: async(_:any, {businessId}: {businessId:string}, ctx:Context):Promise<IBusinessInvite[] | null> => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            await checkBusinessPermission(businessId, ctx.user, ["admin", "super-admin"]);

            const invites = await BusinessInvite.find({ business: businessId })
                .populate("business", "id name")
                .populate("invitedBy", "id fname lname email")
                .sort({ createdAt: -1 })
            return invites;

        },
        validateInvite: async(_:any, {token}: any) => {
            const invite = await BusinessInvite.findOne({token})
            .populate("business", "id name")
            .populate("invitedBy", "id fname lname email")

            console.log(token)

            if (!invite) throw new Error("Invalid or expired invitation");
            if (invite.status !== "pending") throw new Error("Invitation already used or expired");
            if (invite.expiresAt < new Date()) throw new Error("Invitation has expired");

            return invite;
        },
    },

    Mutation: {
        inviteBusinessMember: async (_:any, {input}: any, ctx:Context ): Promise<IBusinessInvite | null> => {
            const { businessId, email, role } = input;
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user; 

            if (!ctx.subscriptionValid) {
                throw new Error("Subscription inactive. Upgrade required.");
            }

            //Check if max amount of seats for business on subscription plan
            const business = await Business.findById(businessId)

            if (!business) throw new Error("Business not found");

            const members = business.members.length;
            const subscribedUsers = business.subscribedUsers;

            if (members >= subscribedUsers) {
            throw new Error("Seat limit reached. Upgrade your plan.");
            }

            let invite = await BusinessInvite.findOne({ 
                email, 
                business: businessId, 
                status: "pending" 
            });

            await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);

            const token = nanoid(24);
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

            const existing = await BusinessInvite.findOne({ email, business: businessId, status: "pending" });
            if (existing) {
                existing.expiresAt = expiresAt;
                await existing.save();
            } else {
                invite  = await BusinessInvite.create({
                email,
                business: businessId,
                role,
                token,
                invitedBy: ctx.user,
                expiresAt,
                });
            }
            const businessInvite = await BusinessInvite.findById(invite?._id)
                .populate("business", "id name")
                .populate("invitedBy", "id fname lname")

            if (!businessInvite) {
                throw new Error("Invite creation failed");
            }
            return businessInvite
        },
        acceptBusinessInvite: async (_: any, { token }: any, ctx: Context) => {
            const invite = await BusinessInvite.findOne({ token });
            
            if (!invite) throw new Error("Invalid or expired invitation");
            if (invite.status !== "pending") throw new Error("Invitation already used");
            if (invite.expiresAt < new Date()) throw new Error("Invitation has expired");

            const user = await User.findById(ctx.user);
            if (!user) throw new Error("User must be logged in to accept invitation");

            const business = await Business.findById(invite.business);
            if(!business) throw new Error("Business not found");

            // Add business to user's businesses array if not already there
            const alreadyMember = user.businesses.some(
                (b) => b.business.toString() === business._id.toString()
            );

            if (!alreadyMember) {
                user.businesses.push({
                business: business._id,
                role: invite.role,
                });
                await user.save();
            }

            //Add user to business.members if not already added
            const alreadyInBusiness = business.members.some(
                (m: any) => m.user.toString() === user._id.toString()
            );

            if (!alreadyInBusiness) {
                business.members.push({
                user: user._id,
                role: invite.role,
                });
                await business.save();
            }

            // Update invite status
            invite.status = "accepted";
            await invite.save();

             await pushNotification({
                userId: user?._id.toString(), // receiver: invited user
                businessId: invite.business.toString(),
                type: NotificationType.INVITE_ACCEPTED,
                title: "Invite accepted",
                message: `You have joined ${business.name}.`,
                data: {
                businessId: invite.business,
                inviteId: invite._id,
                },
            });

            // optionally notify business owner too
            await pushNotification({
                userId: invite.business.toString(),
                businessId: business._id.toString(),
                type: NotificationType.INVITE_ACCEPTED,
                title: "New team member joined",
                message: `${user.fname} ${user.lname} accepted your invite to ${business.name}.`,
                data: {
                memberId: ctx?.user,
                businessId: business._id,
                },
            });

            const populatedInvite = await BusinessInvite.findById(invite?._id)
              .populate("business", "id name")
              .populate("invitedBy", "id fname lname email")

            return populatedInvite;

        },
        revokeBusinessInvite: async (_: any, { token }: any, ctx: Context) => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user; 

            const invite = await BusinessInvite.findOne({ token });
            if (!invite) throw new Error("Invalid or expired invitation");
             await checkBusinessPermission(invite.business.toString(), currentUserId, ["admin", "super-admin"]);

             if (invite.status !== "pending") {
                throw new Error("Only pending invites can be revoked");
            }

             // Update invite status
              invite.status = "revoked";
              invite.expiresAt = new Date();

              await invite.save();

              const populatedInvite = await BusinessInvite.findById(invite?._id)
              .populate("business", "id name")
              .populate("invitedBy", "id fname lname email")

           
            return populatedInvite;
        }
    }
}