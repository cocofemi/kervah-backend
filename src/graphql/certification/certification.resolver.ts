import { Certificate } from "../../models/certificate.model";
import { ICertificate } from "../../interfaces/certificate.types";
import { nanoid } from "nanoid";
import { checkBusinessPermission } from "../../utils/checkBusinessPermision";
import { CourseProgress } from "../../models/courseprogress.model";
import { Group } from "../../models/groups.model";
import { pushNotification } from "../../services/notificationService";
import { NotificationType } from "../../models/notification.model";
import { ICourse } from "../../interfaces/course.types";
import { Course } from "../../models/course.model";

interface Context {
    auth: boolean
    user?: string; 
}

export const certificateResolver = {
    Query: {
        certificatesByUser: async (_: any, { businessId }: any, ctx: Context) => {
        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
        const currentUserId = ctx.user;
        
        // User can see their own certificates or admins can view all
        if (currentUserId !== ctx?.user) {
            await checkBusinessPermission(businessId, currentUserId, ["admin", "member", "super-admin"]);
        }

        const filter: any = { user: ctx?.user };
        if (businessId) filter.business = businessId;

        return await Certificate.find(filter)
            .populate("user course business")
            .sort({ createdAt: -1 })
        },
        
        certificatesByBusiness: async (_: any, { businessId }: any, ctx: Context) => {
        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
        const currentUserId = ctx.user;
        await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);

        return await Certificate.find({ business: businessId })
            .populate("user", "fname lname email")
            .populate("course", "title")
            // .populate("group", "name")
        },

        certificateById: async (_: any, { id }: any, ctx: Context) => {
        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

        // const currentUserId = ctx.user;
        // const cert = Certificate.findById(id)
        // await checkBusinessPermission(cert.business._id, currentUserId, ["admin", "member"]);

        const populatedCert = await Certificate.findById(id)
            .populate("user", "fname lname email")
            .populate("business", "name")
            .populate("course", "title")

        if (!populatedCert) throw new Error("Certificate not found");
        return populatedCert;
        },

        userCoursesWithCertificates: async (_: any, { businessId }: any, ctx: Context) => {
            if(!ctx.auth || !ctx.user) throw new Error("Unauthorized")
            const currentUserId = ctx.user
            // Only allow user themselves or business admins
            if (currentUserId !== ctx?.user) {
                await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"]);
            }

            // Get all course progress records for this user + business
            const progresses = await CourseProgress.find({
                user: ctx?.user,
                business: businessId,
            }).populate("course", "id title category duration")

            if (!progresses.length) return [];

            // Fetch all certificates for same context
            const certificates = await Certificate.find({
                user: ctx?.user,
                business: businessId,
            }).populate("course user business")

            // Map certificates by courseId for quick lookup
            const certMap = new Map<string, any>();
            for (const cert of certificates) {
                certMap.set(cert.course._id.toString(), cert);
            }

            // Combine results
            return progresses.map((p) => ({
                course: p.course,
                progressStatus: p.status,
                score: p.score,
                certificate: certMap.get(p.course._id.toString()) || null,
            }));
        },
},
Mutation: {
    issueCertificate: async(_:any, {input}:any, ctx:Context):Promise<ICertificate | null> => {
        const { businessId, courseId } = input;

        if(!ctx.auth || !ctx.user) throw new Error("Unauthorized")

        // Confirm user passed the course
        const progress = await CourseProgress.findOne({
            user: ctx?.user,
            business: businessId,
            course: courseId,
            status: "passed",
        })
        .populate("course", "title lessons maxScore")
        .populate("business", "ownerId")                  
        .populate("user", "fname lname email");

        const course = await Course.findById(courseId);

        if (!progress) throw new Error("User has not passed this course");

        // // Prevent duplicate certificates
        // const existing = await Certificate.findOne({
        //     user: ctx?.user,
        //     course: courseId,
        //     business: businessId,
        // });
        // if (existing) return existing;

        const certificate = await Certificate.create({
            user: ctx?.user,
            business: businessId,
            // group: groupId,
            course: courseId,
            certificateId: `KERVAH-${nanoid(10)}`,
            issueDate: new Date(),
            score: progress.score,
            status: "issued",
        });

        await pushNotification({
            userId: ctx?.user.toString(),
            businessId: businessId.toString(),
            type: NotificationType.CERTIFICATE_ISSUED,
            title: "Certificate issued",
            message: `Your certificate for "${course?.title}" is ready.`,
            data: {
                certificateId: certificate._id,
                courseId: course?.id,
            },
        });


        const populatedCert = Certificate.findById(certificate._id)
        .populate("user course business")
        return await populatedCert
        
    },
    }
}