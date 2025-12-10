import { CourseGroup } from "../../models/course-groups.model";
import { Course } from "../../models/course.model";

interface Context {
    auth: boolean;
    user?: {id: string};
}

export const courseGroupResolver = {
    Query: {
        courseGroup: async (_: any, { id }: any, ctx:Context) => {
            if (!ctx.auth) throw new Error("Unauthorized");
            return CourseGroup.findById(id).populate("courses");
        },
        courseGroups: async (_:any, __:any, ctx:Context) => {
            if (!ctx.auth) throw new Error("Unauthorized");
            return CourseGroup.find().populate("courses");
        },
    },

    Mutation: {
        createCourseGroup: async (_: any, { input }: any, ctx:Context) => {
            if (!ctx.auth) throw new Error("Unauthorized");
            if (!Array.isArray(input.courseIds) || input.courseIds.length === 0) {
                throw new Error("courseIds must be a non-empty array");
            }

            

            const validCourses = await Course.find({ _id: { $in: input.courseIds } }).select("_id");
            console.log(validCourses)

            if (validCourses.length !== input.courseIds.length) {
                const validSet = new Set(validCourses.map(c => c._id.toString()));
                const invalid = input.courseIds.filter(id => !validSet.has(id));
                throw new Error(`Invalid courseIds: ${invalid.join(", ")}`);
            }

            const group = await CourseGroup.create({
                    name: input.name,
                    description: input.description,
                    courses: input.courseIds, 
            });
            return group.populate("courses");
        },
        updateCourseGroup: async (_: any, {input }: {input:any}, ctx:Context) => {
            if (!ctx.auth) throw new Error("Unauthorized");
            const updateData: any = {};

            if (input.name !== undefined) updateData.name = input.name;
            if (input.description !== undefined) updateData.description = input.description;

            // Fetch all valid courses
            const validCourses = await Course.find({ _id: { $in: input.courseIds } }).select("_id");

            if (validCourses.length !== input.courseIds.length) {
                const validSet = new Set(validCourses.map(c => c._id.toString()));
                const invalid = input.courseIds.filter(id => !validSet.has(id));
                throw new Error(`Invalid courseIds: ${invalid.join(", ")}`);
            }

            const group = await CourseGroup.findById(input.id);
            if (!group) throw new Error("CourseGroup not found");

            let current = new Set(group.courses.map((c) => c.toString()));

            if (Array.isArray(input.courseIds)) {
                input.courseIds.forEach((id:string) => current.add(id));
            }

            updateData.courses = Array.from(current);
            const updated = await CourseGroup.findByIdAndUpdate(input.id, updateData, { new: true });
            return updated?.populate("courses");
        },

        deleteCourseGroup: async (_: any, { id }: {id:string}, ctx:Context) => {
            if (!ctx.auth) throw new Error("Unauthorized");
            const deleted = await CourseGroup.findByIdAndDelete(id);
            return !!deleted;
        },
    }
}