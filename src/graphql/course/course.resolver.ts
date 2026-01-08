import { Course } from "../../models/course.model";
import { User } from "../../models/user.model";
import { ICourse  } from "../../interfaces/course.types";

interface Context {
    auth: boolean;
    user?: {id: string};
    subscriptionValid: boolean
}

export const courseResolver = {
    Query : {
        courses: async (_: any, __: any, ctx: Context): Promise<ICourse[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
              if (!ctx.subscriptionValid) throw new Error("Subscription expired")
                return await Course.find({$and: [{ archive: { $ne: true } },
                    { publish: { $ne: false } }]})
                .populate({ path: "createdBy", select: "id fname lname email" })
                .populate({ path: "lessons", select: "id title textContent videoUrl" })
                .sort({ createdAt: -1 })
        },

        allCreatedCourses: async (_: any, __: any, ctx: Context): Promise<ICourse[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Course.find({$and: [{ archive: { $ne: true } }]})
                .populate({ path: "createdBy", select: "id fname lname email" })
                .populate({ path: "lessons", select: "id title textContent videoUrl" })
                .sort({ createdAt: -1 })
        },
        course: async (_: any, {id}:{id: string}, ctx: Context): Promise<ICourse | null> => {
            if (!ctx.auth) throw new Error("Unauthorized");
            if (!ctx.subscriptionValid) throw new Error("Subscription expired")
            const populatedCourse =  await Course.findById(id)
                .populate({ path: "createdBy", select: "id fname lname email" })
                .populate("scenarios",  "id title instructions rubric")
                .populate("lessons",  "id title textContent videoUrl")
                return populatedCourse
        },
    },
    Mutation: {
        createCourse: async(_:any, {title, description, category, thumbnail, 
            duration}: {title: string, 
            description:string, category:string, thumbnail:string, 
            duration:string}, ctx: Context): Promise<ICourse | null> => {
            if (!ctx.auth) throw new Error("Unauthorized");

            const user = await User.findById(ctx?.user)
            if(user?.role !== 'super-admin' ){
                throw new Error("Only super-admins can create courses")
            }
            const course = new Course({title, description, category, thumbnail, duration, createdBy: user?._id})
            await course.save()
            const populatedCourse = Course.findById(course._id)
            .populate({ path: "createdBy", select: "id fname lname email" });
            return populatedCourse
        },
        updateCourse: async(_:any, {input}: any, ctx: Context): Promise<ICourse | null> => {
            const {id, title, description, category, 
            thumbnail, duration, publish, archive} = input
            const superAdmin = await User.findById(ctx.user)
            if(!ctx.auth && superAdmin?.role !== 'super-admin'){
                throw new Error("Only super-admins can update courses")
            }
            const course = await Course.findById(id)
            if(!course) throw new Error("Course does not exist");
            return await Course.findByIdAndUpdate(id, {title, description, category, thumbnail, duration, publish, archive}, {new: true, runValidators: true})
        },
        // archiveCourse: async(_:any, {id}: {id: string}, ctx:Context): Promise<boolean> => {
        //     const superAdmin = await User.findById(ctx.user)
        //     if(!ctx.auth && superAdmin?.role !== 'super-admin'){
        //         throw new Error("Only super-admins can archive courses")
        //     }
        //     const course = await Course.findById(id)
        //     if(!course) throw new Error("Course does not exist");
        
            
        //     await Course.findByIdAndUpdate(id, {archive: true},{new: true, runValidators: true})
        //     return true
        // }
    }
}