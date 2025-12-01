import { Result } from "../../models/result.model";
import { IResult, IResultResponse } from "../../interfaces/result.types";
import { User } from "../../models/user.model";

interface Context {
    auth: boolean;
    user?: {id: string};
}

export const resultResolver = {
    Query: {
        results: async (_: any, __: any, ctx: Context): Promise<IResult[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Result.find();
        },
        resultByUser: async (_: any, {userId}:{userId: string}, ctx: Context): Promise<IResult[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Result.find({userId})
        },
    },
    
    Mutation: {
        createResult: async(_:any, {userId, courseId, assessmentScore, 
        scenarioScore}: {userId: string, courseId:string, 
        assessmentScore:string, scenarioScore:string, 
        }, ctx:Context): Promise<IResultResponse | null > => {
            if (!ctx.auth) throw new Error("Unauthorized");

            const checkUser = await User.findById(userId);
            if (!checkUser) throw new Error("User doesn't exist");

            const result = new Result({userId, courseId, assessmentScore,
                scenarioScore
            })
            await result.save()
            return {result}
        },

        updateResult : async(_:any, {id, userId, assessmentScore, 
        scenarioScore}: {id:string, userId: string, assessmentScore:string, scenarioScore:string, 
        }, ctx:Context): Promise<IResultResponse | null > => {
            if (!ctx.auth) throw new Error("Unauthorized");

            const checkUser = await User.findById(userId);
            if (!checkUser) throw new Error("User doesn't exist");

            const result = await Result.findById(id);
            if(!result) throw new Error("Result doesn't exist")

            return await Result.findByIdAndUpdate(id, {assessmentScore, scenarioScore}, {new: true, runValidators: true})

        }
    }
}