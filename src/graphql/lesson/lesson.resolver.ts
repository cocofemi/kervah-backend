import { Lesson } from "../../models/lesson.model";
import { ILesson } from "../../interfaces/lessons.types";
import { User } from "../../models/user.model";
import { Course } from "../../models/course.model";

interface Context {
    auth: boolean;
    user?: {id: string};
}

export const lessonResolver = {
    Query : {
        lessons: async(_: any, __:any, ctx: Context): Promise<ILesson[]> => {
                if (!ctx.auth) throw new Error("Unauthorized");
                    return await Lesson.find().populate({ path: "createdBy", select: "id fname lname email" })
        },
        lesson: async (_: any, {id}:{id: string}, ctx: Context): Promise<ILesson | null> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Lesson.findById(id).populate({ path: "createdBy", select: "id fname lname email" })
                .populate({path: "assessments", select: "id question options correctAnswer explanation"})
        },  
        lessonByCourse: async(_:any, {courseId}:{courseId:string}, ctx: Context): Promise<ILesson[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Lesson.find({courseId})
        }
    },
    Mutation: {
        createLesson: async(_: any, {input}:any, ctx: Context): Promise<ILesson | null> => {
            const {title, courseId, videoUrl, textContent} = input 
                const superAdmin = await User.findById(ctx.user)
                if(!superAdmin || superAdmin.role !== 'super-admin' && !ctx.auth ){
                    throw new Error("Only super-admins can create courses")
                }

                const lesson = new Lesson({title, courseId,
                    videoUrl, textContent, createdBy:ctx?.user
                })

                const course = await Course.findById(courseId)

                 // Add lesson to course's lessons array if not already there
                const addLessonToCourse = course?.lessons.some(
                    (c) => c.toString() === lesson._id.toString()
                );

                if (!addLessonToCourse && course) {
                    course.lessons.push(lesson._id);
                    await course.save();
                }
                
                await lesson.save()
                const populatedLesson = Lesson.findById(lesson._id)
                .populate({path: "createdBy", select: "id fname lname email", })
                return populatedLesson
            },

        updateLesson: async(_: any, {input}: any, ctx: Context): Promise<ILesson | null> => {
            const {lessonId, title, videoUrl, textContent} = input 
                const superAdmin = await User.findById(ctx?.user)
                if(!superAdmin || superAdmin.role !== 'super-admin' && !ctx.auth ){
                    throw new Error("Only super-admins can create lessons")
                }
                const lesson = await Lesson.findById(lessonId)
                if(!lesson) throw new Error("lesson does not exist");
                return await Lesson.findByIdAndUpdate(lessonId, {title, videoUrl, textContent}, {new: true, runValidators: true})
        },
        deleteLesson: async(_:any, {id}: {id: string}, ctx:Context): Promise<boolean> => {
            const lesson = await Lesson.findById(id)
            if(!lesson) throw new Error("Lesson does not exist");
            const superAdmin = await User.findById(ctx.user)
            if(!superAdmin || superAdmin.role !== 'super-admin' && !ctx.auth ){
                throw new Error("Only super-admins can delete lessons")
            }

            const course = await Course.findById(lesson?.courseId)

            if (course) {
                course.lessons = (course.lessons || []).filter(
                    (m) => m.toString() !== lesson._id.toString()
                );
                await course.save();
            }

            await Lesson.findByIdAndDelete(id)
            return true
        }
    }
}

