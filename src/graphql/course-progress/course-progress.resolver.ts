import { CourseProgress } from "../../models/courseprogress.model";
import { ICourseProgress } from "../../interfaces/courseprogress.types";
import { checkBusinessPermission } from "../../utils/checkBusinessPermision";
import { Group } from "../../models/groups.model";
import { Course } from "../../models/course.model";
import { ScenarioSubmission } from "../../models/scenarioSubmission.model";
import { Scenario } from "../../models/scenario.model";
import { pushNotification } from "../../services/notificationService";
import { NotificationType } from "../../models/notification.model";
import { Business } from "../../models/business.model";
import { User } from "../../models/user.model";
import { IBusiness } from "../../interfaces/business.types";
import { IUser } from "../../interfaces/user.types";
import { ICourse } from "../../interfaces/course.types";

interface Context {
   auth: boolean;
   user?:  string ;
}

export const courseProgressResolver = {
    Query : {
      userCoursesWithProgress: async(_:any, {businessId}:{ businessId:string},ctx:Context ) => {
        if (!ctx.auth) throw new Error("Unauthorized");

        const groups = await Group.find({ business: businessId, members: ctx.user })
        .populate({path: "courses",
          select: "id title description lessons scenarios category duration thumbnail", 
          populate: [{ path: "lessons", select: "", populate: {
            path: "assessments", select: ""
          } },
          { path: "scenarios", select: "" }
          ]})
       

        const assignedCourses = groups.flatMap(g => g.courses);
        const progresses = await CourseProgress.find({ user: ctx?.user, status: { $in: ["not_started", "started"] } })
        .populate("course")
        .populate("business")


        const progressMap = new Map(progresses.map(p => [p.course.id, p]));

        return assignedCourses.map(course => ({
          course,
          progress: progressMap.get(course.id) || null
        }));
                  
      },
        courseProgressByGroup: async (_: any, { groupId }: any, ctx: Context) => {
          // Verify user is member or admin in that business
          if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
          
          const sampleProgress = await CourseProgress.findOne({ group: groupId });
          if (!sampleProgress) throw new Error("No progress found");
          await checkBusinessPermission(sampleProgress.business.toString(), ctx.user, ["admin", "member"]);

          return await CourseProgress.find({ group: groupId })
              .populate("user", "id name email")
              .populate("course", "id title category")
        },
        userCourseProgressStatus: async (_:any, { courseId, businessId}: 
          {courseId: string, businessId: string}, ctx:Context) => {
            if (!ctx.auth) throw new Error("Unauthorized");
          
            const status = await CourseProgress.findOne({
              user: ctx?.user,
              course: courseId,
              business: businessId,
            })
              .sort({ updatedAt: -1 })   // ensures newest attempt returned
              .populate("course business user");

            return status;
          },
          userCourseResults: async(_:any, {businessId}: {businessId: string}, ctx:Context) => {
           if (!ctx.auth) throw new Error("Unauthorized");

          const filter: any = {
            user: ctx?.user,
            business: businessId,
            status: { $in: ["passed", "failed", "completed", "archived"] },
          };

           const results = await CourseProgress.find(filter)
              .sort({ updatedAt: -1 })
              .populate("course business user");
              
           return results
        }
    },

    Mutation: {
    resumeCourse: async (_:any, {courseId, businessId}: any, ctx:Context ) => {
      if (!ctx.auth) throw new Error("Unauthorized");
      
        //find user course progress for lesson
        let allProgress = await CourseProgress.find({
          user: ctx?.user,
          course: courseId
        })

        //check if there are any lessons currently started
        let progress = allProgress.find((p) => p.status === "started");

        const course = await Course.findById(courseId).select("lessons");
        const totalLessons = course?.lessons.length || 0;

          if (progress) {
            const completedCount = progress.completedLessons.length;
            const percentage =
              totalLessons > 0
                ? Math.round((completedCount / totalLessons) * 100)
                : 0;

            progress.percentage = percentage;
            progress.status = percentage === 100 ? "completed" : "started";
            await progress.save();

            return {
              status: progress.status,
              lastLessonId: progress.lastLessonId,
              completedLessons: progress.completedLessons,
              percentage,
            };
          }

        //if no exisitng progress create a new one 
        const newProgress = await CourseProgress.create({
            user: ctx?.user,
            course: courseId,
            business: businessId,
            status: "started",
            completedLessons: [],
            lastLessonId: course?.lessons?.[0] || null,
            percentage: 0,
            score: null,
            startedAt: new Date(),
          });

          return {
            status: "started",
            lastLessonId: newProgress.lastLessonId,
            completedLessons: [],
            percentage: 0,
          };
      },
      
    updateCourseProgress: async (_: any, { input }:any,ctx:Context):Promise<ICourseProgress | null > => {
      const { courseId, score, lastLessonId, lessonId, percentage  } = input;
       if (!ctx.auth) throw new Error("Unauthorized")

      const progress = await CourseProgress.findOne({
        course:courseId, 
        user:ctx?.user, 
        status: "started"
      });
      if (!progress) throw new Error("No active course progress to update");

      progress.lastLessonId = lastLessonId;
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      if (score !== undefined) {
        progress.score = progress.score + score;
      }

      if (percentage !== undefined) {
        progress.percentage = Math.min(Math.ceil(percentage), 100);
      }

      progress.lastUpdated = new Date();
      await progress.save();
      
      return await progress.populate("course business user");
    },

    completeCourse: async (_: any, { input }: any, ctx:Context) => {
      const { courseId, scenarioId} = input;
      
      if (!ctx.auth || !ctx?.user) throw new Error("Unauthorized");

      const progress = await CourseProgress.findOne({course:courseId, user:ctx?.user, status: "started"})
        .populate("course", "title")
        .populate("business", "ownerId")
        .populate("user", "fname lname email")

      if (!progress) throw new Error("No active course progress to complete");

      const scenarioScore = await ScenarioSubmission.findOne({
        scenarioId:scenarioId, 
        userId: ctx?.user 
      })
        .sort({ createdAt: -1 });
      
      const business = progress.business as IBusiness;
      const user = progress.user as IUser
      // const course = progress?.course as ICourse

      const course = await Course.findById(courseId);
      const scenario = await Scenario.findById(scenarioId);

      const lessonsCount = course?.lessons?.length ?? 0;
      const scenarioMax = scenario?.maxScore ?? 0;

      const lessonPoints = progress.score ?? 0;
      const scenarioPoints = scenarioScore?.aiScore ?? 0;

      const totalPossible = lessonsCount * 5 + scenarioMax;

      if (totalPossible <= 0) {
        progress.status = "no_completion";
        progress.completedAt = new Date();
        progress.lastUpdated = new Date();
        await progress.save();
        return progress;
      }

      const finalScore = ((lessonPoints + scenarioPoints) / totalPossible) * 100;

      progress.score = finalScore;
      progress.percentage = 100;
      progress.completedAt = new Date();
      progress.lastUpdated = new Date();

      if (finalScore >= 70) {
        progress.status = "passed";
      } else if (finalScore < 50) {
        progress.status = "failed";
      } else {
        progress.status = "completed"; // fallback neutral completion
      }

      await progress.save();

      const passed = finalScore >= 70
    

      //Notify member
      await pushNotification({
        userId: ctx?.user.toString(),
        businessId: business.ownerId.toString(),
        type: passed ? NotificationType.COURSE_PASSED : NotificationType.COURSE_FAILED,
        title: passed ? "You passed 🎉" : "You did not pass",
        message: passed
          ? `Great job! You passed "${course?.title ?? "this course"}" with a score of ${finalScore.toFixed(0)}%.`
          : `You scored ${finalScore.toFixed(0)}% on "${course?.title ?? "this course"}". You can retake the course.`,
        data: {
          courseId: courseId,
          finalScore,
          passed,
        },
      });

      //Notify Organsiation
     if (!business.ownerId) {
        throw new Error("Business has no owner");
      }

      await pushNotification({
        userId: business.ownerId.toString(),
        businessId: business.ownerId.toString(),
        type: NotificationType.COURSE_COMPLETED,
        title: "Course completed",
        message: `${user.fname} ${user.lname} completed ${course?.title ?? "this course"}.`,
        data: { courseId },
      });

      return await CourseProgress.findById(progress._id)
        .populate("course business")
        .populate("course", "id title")
        .populate("user", "id fname lname email");
    },

     retakeCourse: async (_: any, { courseId, businessId }:any, ctx: Context) => {
      if (!ctx.auth) throw new Error("Unauthorized");

      const userId = ctx?.user;
      await CourseProgress.deleteMany({
        user: userId,
        course: courseId,
        business: businessId,
        status: "started"
      });

      const course = await Course.findById(courseId).select("lessons");
      const firstLessonId = course?.lessons?.[0] ?? null;

      await CourseProgress.create({
        user: userId,
        course: courseId,
        business: businessId,
        status: "started",
        completedLessons: [],
        lastLessonId: firstLessonId,
        percentage: 0,
        score: 0,
        startedAt: new Date(),
        lastUpdated: new Date(),
      });

      return {
        status: "started",
        lastLessonId: firstLessonId,
        completedLessons: [],
        percentage: 0,
      };
    },
      },
} 