import { Assessment } from "../../models/assessment.model";
import { User } from "../../models/user.model";
import {  IAssessment } from "../../interfaces/assesments.types";
import { Lesson } from "../../models/lesson.model";

interface Context {
    auth: boolean;
    user?: {id: string};
}

export const assessmentResolver = {
    Query: {
        assessments: async (_: any, __: any, ctx: Context): Promise<IAssessment[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Assessment.find();
        },
        assessment: async (_: any, {id}:{id: string}, ctx: Context): Promise<IAssessment | null> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Assessment.findById(id);
        },
        assessmentByCourse: async(_:any, {courseId}:{courseId:string}, ctx: Context): Promise<IAssessment[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Assessment.find({courseId})
        }
    },

    Mutation: {
        createAssessment: async(_: any, { input}:any, ctx: Context): Promise<IAssessment | null> => {
            const {question, options, correctAnswer, explanation, lessonId, } = input
            const superAdmin = await User.findById(ctx?.user)
            if(!superAdmin || superAdmin.role !== 'super-admin' && !ctx.auth ){
                throw new Error("Only super-admins can create assessments")
            }
            const assessment = new Assessment({ question, options, correctAnswer,
                explanation, lessonId, createdBy:ctx?.user})
            

            const lesson = await Lesson.findById(lessonId)

            // Add lesson to course's lessons array if not already there
            const addAssesmentToLesson = lesson?.assessments.some(
                (c) => c.toString() === lesson._id.toString()
            );

            if (!addAssesmentToLesson && lesson) {
                lesson.assessments.push(assessment?._id);
                await lesson.save();
            }

            await assessment.save()

            const populatedAssessment = Assessment.findById(assessment._id)
            .populate({ path: "createdBy", select: "id fname lname email" })

            return populatedAssessment
        },

        updateAssessment: async(_: any, {input}: any, ctx: Context): Promise<IAssessment | null> => {
            const {assessmentId, question, options, correctAnswer} = input 
                const superAdmin = await User.findById(ctx?.user)
                if(!superAdmin || superAdmin.role !== 'super-admin' && !ctx.auth ){
                    throw new Error("Only super-admins can create lessons")
                }
                const assessment = await Assessment.findById(assessmentId)
                if(!assessment) throw new Error("lesson does not exist");
                return await Assessment.findByIdAndUpdate(assessmentId, {question, options, correctAnswer}, {new: true, runValidators: true})
                .populate({path: "createdBy", select: "id fname lname email", })
        },

        deleteAssessment: async(_:any, {id}: {id: string}, ctx:Context): Promise<boolean> => {
            const assessment = await Assessment.findById(id)
            if(!assessment) throw new Error("Assessment does not exist");
            const superAdmin = await User.findById(ctx?.user)
            if(!superAdmin || superAdmin.role !== 'super-admin' && !ctx.auth ){
                throw new Error("Only super-admins can delete assessments")
            }

            const lesson = await Lesson.findById(assessment?.lessonId)
            
            if (lesson) {
                lesson.assessments = (lesson.assessments || []).filter(
                    (m) => m.toString() !== assessment._id.toString()
                );
                await lesson.save();
            }
            await Assessment.findByIdAndDelete(id)

            return true
        }
    }
}