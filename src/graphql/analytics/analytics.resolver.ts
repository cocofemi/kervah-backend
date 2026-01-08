import mongoose from "mongoose";
import { Certificate } from "../../models/certificate.model";
import { Course } from "../../models/course.model";
import { CourseProgress } from "../../models/courseprogress.model";
import { Scenario } from "../../models/scenario.model";
import { ScenarioSubmission } from "../../models/scenarioSubmission.model";
import { checkBusinessPermission } from "../../utils/checkBusinessPermision";
import { ICourseProgress } from "../../interfaces/courseprogress.types";
import { Business } from "../../models/business.model";
import { User } from "../../models/user.model";


interface Context {
   auth: boolean;
   user?:  string ;
}

export const analyticsResolver = {
    Query: {
        courseFunnel: async (_: any, { courseId, businessId }: any, ctx: Context) => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

             await checkBusinessPermission(businessId, ctx?.user, ["admin","super-admin" ]);

            const totalLessons = await Course.findById(courseId).select("lessons");
            const lessonCount = totalLessons?.lessons?.length ?? 1;
            const scenario = await Scenario.findOne({courseId})

            const progresses = await CourseProgress.find({
                course: courseId,
                business: businessId,
            });

            const started = progresses.filter((p:ICourseProgress) => p.status === "started").length

            const quarter = progresses.filter(
                (p:ICourseProgress) => (p.completedLessons.length / lessonCount) >= 0.25
            ).length;

            const half = progresses.filter(
                (p:ICourseProgress) => (p.completedLessons.length / lessonCount) >= 0.5
            ).length;

            const threeQuarter = progresses.filter(
                (p:ICourseProgress) => (p.completedLessons.length / lessonCount) >= 0.75
            ).length;

            const completedLessons = progresses.filter(
                (p:ICourseProgress) => p.completedLessons.length === lessonCount
            ).length;

            const scenarioSubmitted = await ScenarioSubmission.countDocuments({
                scenarioId: scenario?._id,
                businessId: businessId,
            });

            const passed = progresses.filter((p:ICourseProgress) => p.status === "passed").length;

            const certificatesIssued = await Certificate.countDocuments({
                course: courseId,
                business: businessId,
            });

            return {
                started,
                quarter,
                half,
                threeQuarter,
                completedLessons,
                scenarioSubmitted,
                passed,
                certificatesIssued,
            };
        },

        engagementOverTime: async (_: any, { businessId, days }: any, ctx: Context) => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

            await checkBusinessPermission(businessId, ctx?.user, ["admin", "super-admin"]);

            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - (days || 30)); // default 30 days

            // Course starts
            const starts = await CourseProgress.aggregate([
                { $match: { business: new mongoose.Types.ObjectId(businessId), startedAt: { $gte: sinceDate } } },
                {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
                    count: { $sum: 1 },
                },
                },
            ]);

            // Lesson completions
            const completions = await CourseProgress.aggregate([
                { $match: { business: new mongoose.Types.ObjectId(businessId), lastUpdated: { $gte: sinceDate } } },
                {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastUpdated" } },
                    count: { $sum: 1 },
                },
                },
            ]);

            // Scenario submissions
            const submissions = await ScenarioSubmission.aggregate([
                { $match: { businessId: new mongoose.Types.ObjectId(businessId), createdAt: { $gte: sinceDate } } },
                {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
                },
            ]);

            // Normalize into one timeline
            const map: Record<string, any> = {};
            const merge = (arr: any[], key: string) => {
            arr.forEach((item) => {
                const date = item._id;

                if (!map[date]) {
                map[date] = {
                    date,
                    courseStarts: 0,
                    lessonCompletions: 0,
                    scenarioSubmissions: 0,
                };
                }
                map[date][key] = item.count || 0;
            });
            };

            merge(starts, "Course_Starts");
            merge(completions, "Lesson_Completions");
            merge(submissions, "Scenario_Submissions");

            return Object.values(map).sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        },
        recentActivities: async (_:any, { businessId, limit = 5 }: {businessId: string, limit:number}, ctx:Context) => {
            if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

            await checkBusinessPermission(businessId, ctx?.user, ["admin","super-admin"]);

            const activities:any = [];

              const started = await CourseProgress.find({ business: businessId })
                .select("user course startedAt")
                .populate("user", "fname lname email avatar")
                .populate("course", "title");

                started.forEach((p) => {
                    const user = p.user as any
                    const course = p.course as any

                    activities.push({
                    id: `started-${p._id}`,
                    userName: `${user?.fname} ${user?.lname}`,
                    action: "started course",
                    target: course?.title,
                    timestamp: p.startedAt,
                    type: "course_start",
                    })
                });

              const completed = await CourseProgress.find({
                    business: businessId,
                    status: { $in: ["passed", "failed"] },
                })
                    .select("user course completedAt")
                    .populate("user")
                    .populate("course");

                completed.forEach((p) => {
                    const user = p.user as any
                    const course = p.course as any

                    activities.push({
                    id: `completed-${p._id}`,
                    userName: user.fname + " " + user.lname,
                    action: "completed course",
                    target: course?.title,
                    timestamp: p.completedAt,
                    type: "course_complete",
                    })
                });

            activities.sort((a:any, b:any) => {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                return timeB - timeA;
            });
            return activities.slice(0, limit);
        },
            businessUsersPerformance: async (_: any, { businessId }: any, ctx: Context) => {
                if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

                await checkBusinessPermission(businessId, ctx?.user, ["admin", "super-admin"]);

                const business = await Business.findById(businessId)
                    .populate("members.user");

                if (!business) throw new Error("Business not found");

                const users = business.members.map((m: any) => m.user);

                const performances:any = [];

                for (const user of users) {
                    const performance = await getUserPerformance(user._id, businessId);
                    performances.push(performance);
                }

                return performances;
                },

            userPerformance: async (_: any, { businessId, userId }: any, ctx: Context) => {
                if (!ctx.auth) throw new Error("Unauthorized");
                return getUserPerformance(userId, businessId);
            },

    }
}

async function getUserPerformance(userId: string, businessId: string) {
  // All courses the business has
  const business = await Business.findById(businessId)
    .select("assignedCourses");

    if (!business) {
    return {
      userId,
      userName: "",
      courses: [],
    };
  }

   const assignedCourseIds = business.assignedCourses ?? [];

    if (!assignedCourseIds.length) {
        const user = await User.findById(userId);
        return {
        userId,
        userName: `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim(),
        courses: [],
        };
    }

    const courseDocs = await Course.find({
        _id: { $in: assignedCourseIds },
    }).select("_id title lessons");

    // 3) Load progress for this user in this business
    const progressData = await CourseProgress.find({
        user: userId,
        business: businessId,
    });

    
      // 4) Build course performance list
    const courses = courseDocs.map((course) => {
        const progress = progressData.find(
        (p) => p.course.toString() === course._id.toString()
        );

        const totalLessons = course.lessons?.length || 0;
        const completedLessons = progress?.completedLessons?.length || 0;

        const completionRate =
        totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
        courseId: course._id,
        courseName: course.title,
        completionRate,
        score: progress?.score?.toFixed(0) ?? null,
        };
    });

    const user = await User.findById(userId);

    return {
        userId,
        userName: `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim(),
        courses,
    };

}