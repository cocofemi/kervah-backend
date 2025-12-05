import { Types } from "mongoose"
import { Business } from "../../models/business.model";
import { User } from "../../models/user.model";
import { IBusiness} from "../../interfaces/business.types";
import { checkBusinessPermission } from "../../utils/checkBusinessPermision";
import { Course } from "../../models/course.model";
import { Group } from "../../models/groups.model";
import { Certificate } from "../../models/certificate.model";
import { CourseProgress } from "../../models/courseprogress.model";

interface Context {
   auth: boolean;
   user?:  string ;
}

export const businessResolver = {
    Query : {
        businesses: async (_: any, __: any, ctx: Context): Promise<IBusiness[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
            const user = await User.findById(ctx.user)
            if(user?.role != "super-admin")throw new Error("Unauthorized");
            const populatedBusinesses = await Business.find().populate({
                path: "ownerId",
                select: "id fname lname email",
                })
                .populate({
                    path: "members.user",
                    select: "id, fname lname email"
                })
                .populate({
                    path: "assignedCourses",
                    select: "id title duration"
                })

              return populatedBusinesses
        },
        business: async (_: any, {businessId}:{businessId: string}, ctx: Context): Promise<IBusiness | null> => {
            if (!ctx.auth) throw new Error("Unauthorized");
              return await Business.findById(businessId) .populate({
                path: "ownerId",
                select: "id fname lname email",
                })
                .populate({
                    path: "members.user",
                    select: "id, fname lname email"
                })
        },
        businessCourses: async (_: any, { businessId }: any, ctx: Context) => {
            // Only members of the business can view available courses
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user;

            const business = await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);
            const populated = await Business.findById(business._id)
            .populate({
                path: "assignedCourses",
                select: "id title description lessons category duration thumbnail",
                populate: {
                path: "lessons",
                select: "id title textContent ",
                }
            });

            return populated?.assignedCourses || [];
        },

        businessOverview: async (_: any, { businessId }: any, ctx: Context) => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
                await checkBusinessPermission(businessId, ctx?.user, ["admin", "super-admin"]);

            const [totalMembers, totalCourses, totalGroups, totalCertificates] =
                await Promise.all([
                // Members linked to business
                Business.findById(businessId).then((b) => b?.members?.length ?? 0),

                // Courses assigned to business
                Business.findById(businessId).then((b) => b?.assignedCourses?.length ?? 0),

                // Groups under business
                Group.countDocuments({ business: businessId }),

                // Certificates issued under business
                Certificate.countDocuments({ business: businessId }),
                ]);

            return {
                totalMembers,
                totalCourses,
                totalGroups,
                totalCertificates,
            };
        },

        businessLearningSummary: async (_: any, { businessId }: any, ctx: Context) => {
            if(!ctx.auth || !ctx.user) throw new Error("Unauthorized")
            const currentUserId = ctx.user
            //Verify the user has permission
            await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);

            //Get ALL members of business
            const business = await Business.findById(businessId)
                .populate({
                path: "members",
                populate: { path: "user", select: "id fname lname email avatar" }
                })
            const members = business?.members ?? [];

            //Get groups and courses associated with business
            const groups = await Group.find({ business: businessId })
                .populate({
                    path: "members",
                    model: "User",
                    select: "id fname lname email avatar"
                })
                .populate({
                    path: "courses",
                    model: "Course",
                    select: "id title category duration"
                });

            // Build: userId → courses assigned
            const userAssignedCourses = new Map<string, any[]>();

            for (const g of groups) {
            for (const m of g.members ?? []) {
                // m is a User document or ObjectId
                const userId =
                typeof m === "string"
                    ? m
                    : (m as any)._id
                    ? (m as any)._id.toString()
                    : m.toString();

                // Keep ONLY populated Course docs with _id
                const gCourses = (g.courses ?? []).filter(
                (c: any) => c && (c as any)._id
                );

                const existing = userAssignedCourses.get(userId) || [];
                userAssignedCourses.set(userId, [...existing, ...gCourses]);
            }
            }


            //Get all course progression associated with business
            const progresses = await CourseProgress.find({ business: businessId })
                  .populate("user", "id fname lname email")
                  .populate("course", "id title category duration")
              

            // Build: user-course → progress record
            const progressMap = new Map<string, any>();
            for (const p of progresses) {
                const key = `${p.user.id}-${p.course._id}`;
                progressMap.set(key, p);
            }

            //Aseembly all user learning info for business
            const results: any[] = [];

            for (const member of members) {
            const user = member.user;
            if (!user) continue;

            const userId =
                typeof user === "string"
                ? user
                : (user as any)._id
                ? (user as any)._id.toString()
                : user.toString();

            const assignedCoursesRaw = userAssignedCourses.get(userId) || [];

            // only keep valid populated courses
            const assignedCourses = assignedCoursesRaw.filter(
                (c: any) => c && (c as any)._id
            );

            const courseProgressList: any[] = [];

            for (const courseDoc of assignedCourses) {
                const courseId = (courseDoc as any)._id?.toString();
                if (!courseId) continue; // absolutely no invalid courses

                const key = `${userId}-${courseDoc._id}`;
                const progress = progressMap.get(key) || null;

                let progressId
                let status = "not_started";
                let score: number | null = null;
                let completedAt: Date | null = null;

                if (progress) {
                    progressId = progress.id
                    status = progress.status;
                    score = progress.score;
                    completedAt = progress.completedAt;
                }

                // EXPLICITLY BUILD A PLAIN COURSE OBJECT WITH `id`
                const safeCourse = {
                id: courseId,
                title: (courseDoc as any).title ?? "",
                category: (courseDoc as any).category ?? null,
                duration: (courseDoc as any).duration ?? null,
                };

                courseProgressList.push({
                course: safeCourse,
                progressId,
                status,
                score,
                completedAt,
                });
            }

            results.push({
                user,
                courses: courseProgressList,
            });
            }

            return results;
        }
    },

    Mutation: {
         registerBusiness: async (_:any, {name, phone, address, logo, serviceType}: {name: string, phone:string, 
            address:string, serviceType:string,  logo:string}, ctx:Context) => {
            if (!ctx.auth) throw new Error("Unauthorized");
            const owner = await User.findById(ctx.user);

            if (!owner) throw new Error("Owner not found");

            const existing = await Business.findOne({
                ownerId: ctx?.user,
                name: new RegExp(`^${name}$`, "i"), // case-insensitive match
            });

            if (existing) {
            throw new Error("You already have a business with this name.");
            }

            const business = await Business.create({
                name,
                phone,
                address,
                serviceType,
                logo,
                ownerId: owner._id,
                members: [
                {
                    user: owner._id,
                    role: "admin", // owner automatically admin
                },
                ],
            });

            if (!owner.businesses) owner.businesses = [];
            owner.businesses.push({ business: business._id, role: "admin" });
            await owner.save();

            const populated = await Business.findById(business._id)
            .populate({ path: "ownerId", select: "id fname lname email" })
                .populate({ path: "members.user", select: "id fname lname email" });

            if (!populated) throw new Error("Error populating business");
            return populated; // ✅ just return the full doc
        },

        updateBusiness: async(_:any, {id, name, phone, address, logo, serviceType, subscriptionPlan, 
            subscriptionStatus}: {id:string, name: string, phone:string, address: string, 
                ownerId:string, logo:string, serviceType:string,
                subscriptionPlan:string, subscriptionStatus:boolean},ctx: Context): Promise<IBusiness | null> => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user;
            await checkBusinessPermission(id, currentUserId, ["admin", "super-admin"]);
            return await Business.findByIdAndUpdate(id, {name, phone, address, serviceType, logo, subscriptionPlan, subscriptionStatus}, { new: true, runValidators: true })
        },
        
        addMemberToBusiness: async (_: any, { input }: { input: { businessId:string, 
            userId:string, role:string } }, 
            ctx: Context):Promise<IBusiness | null> => {
            const { businessId, userId, role } = input;
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user;

            // only admins can add members
            const business = await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);

            const user = await User.findById(userId);
            if (!user) throw new Error("User not found");

            const exists = business.members.some(
                (m) => m.user.toString() === user._id.toString()
            );
            
            if (exists) throw new Error("User already a member of this business");

           if (!user.businesses) user.businesses = [];
            user.businesses.push({ business: business._id, role });
            await user.save();

            //save user to business(members)
            // Update business
            if (!business.members.some(m => String(m.user) === String(user._id))) {
            business.members.push({ user: user._id, role });
            await business.save();
            }
            
            const populatedBusiness = await Business.findById(business._id)
            .populate({
            path: "members.user",
            select: "id fname lname email",
            })

            if (!populatedBusiness) throw new Error("Business not found after creation");

            return populatedBusiness;
        },

        changeMemberRole: async (_: any, { input }: { input: { businessId:string, 
            userId:string, role:string } }, 
            ctx: Context):Promise<IBusiness | null> => {
                const { businessId, userId, role } = input;
                if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
                const currentUserId = ctx.user; 

            // only admins can add members
            const business = await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);

            const memberIndex = business.members.findIndex(
                (m) => m.user.toString() === userId.toString()
            );

            // Update role
            const member = business.members[memberIndex];
            if (!member) throw new Error("User is not a member");
            member.role = role;
            await business.save();

            //update users business
            const user = await User.findById(userId);
            if (!user) throw new Error("User not found");

            const businessIndex = user.businesses?.findIndex(
                (m) => m.business.toHexString() === businessId.toString())
            
            const userBusiness =  user.businesses[businessIndex];
            if(!userBusiness) throw new Error("Business not found")
            userBusiness.role = role
            await user.save();

            const populated = await Business.findById(business._id)
                .populate({
                path: "members.user",
                select: "id fname lname email",
            })
            return populated;
        },

        removeMemberFromBusiness: async (_: any, { input }: { input: { businessId:string, 
                userId:string } }, 
                ctx: Context):Promise<IBusiness | null> => {
                    const { businessId, userId } = input;
                    if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
                    const currentUserId = ctx.user; 

            // only admins can add members
            const business = await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);

            const user = await User.findById(userId);
            if (!user) throw new Error("User not found");

            const initialCount = business.members.length;
            business.members = business.members.filter(
                (m) => m.user.toString() !== user._id.toString()
            );

            if (business.members.length === initialCount) {
                throw new Error("User is not a member of this business");
            }
            await business.save();

            user.businesses = user.businesses.filter(
                (m) => m.business.toString() !== businessId.toString()
            );

            if (user.businesses.length === initialCount) {
                throw new Error("User is not a member of this business");
            }
            await user.save();

        const populated = await Business.findById(business._id)
            .populate({
            path: "members.user",
            select: "id fname lname email",
            })
        return populated;
        },

        addCourseToBusiness: async (_: any, { input }: { input: { businessId:string, 
                courseIds:string } }, ctx: Context) => {
        const { businessId, courseIds } = input;
        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
        const currentUserId = ctx.user; 

        // Only admin can assign courses
        const business = await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);

        // Fetch all valid courses
        const validCourses = await Course.find({ _id: { $in: courseIds } });
        if (!validCourses.length) throw new Error("No valid courses found");

        // Convert existing IDs to strings for comparison
        const existingIds = business.assignedCourses.map((c) => c.toString());

        // Filter only new, unique courses
        const newCourses = validCourses.filter(
            (course) => !existingIds.includes(course._id.toString())
        );

        if (!newCourses.length) throw new Error("All courses already exist");

        // Push only new courses
        business.assignedCourses.push(...newCourses.map((c) => c._id));
        await business.save();

        const populated = await Business.findById(business._id)
            .populate({
            path: "assignedCourses",
            select: "id title description category duration thumbnail",
            })
           return populated 
    },

    removeCourseFromBusiness: async (_: any, { input }: 
        { input: { businessId:string, 
        courseId:string } }, ctx: Context) => {
        const { businessId, courseId } = input;
        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
        const currentUserId = ctx.user; 

        // ✅ Only admin can assign courses
        const business = await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);

        business.assignedCourses = business.assignedCourses.filter(
            (id) => id.toString() !== courseId.toString()
        );

        await business.save();
        const populated = await Business.findById(business._id)
            .populate({
            path: "assignedCourses",
            select: "id title description category duration thumbnail",
            })
           return populated 
    },    
},
Business: {
    members: async (parent: any) => {
      // If already populated, just return
      if (parent.members?.[0]?.user?.fname) return parent.members;

      const populated = await Business.findById(parent._id)
        .populate({ path: "members.user", select: "id fname lname email" })
        .lean();

      return populated?.members || [];
    },
    assignedCourses: async (parent: any) => {
    const populated = await Business.findById(parent._id)
      .populate({
        path: "assignedCourses",
        select: "id title description category duration thumbnail",
      })
    return populated?.assignedCourses || [];
  },
  },
}
