import { DailyTrivia } from "../../models/daily-trivia.model";

interface Context {
    auth: boolean;
    user?: {id: string};
    isInternal: boolean
}


export const dailyTriviaResolvers = {
  Query: {
    todaysTrivia: async () => {
      const today = new Date().toISOString().split("T")[0];
      return await DailyTrivia.findOne({ id: today });
    },

    dailyTrivia: async (_: any, { id }: any) => {
      return await DailyTrivia.findOne({ id });
    },

  },
    Mutation: {
    createDailyTrivia: async (_: any, input: any, ctx:Context) => {
        if (!ctx.isInternal) {
            throw new Error("Forbidden");
        }
        
      const trivia = await DailyTrivia.findOneAndUpdate(
        {id: input.id},
        { $set: input },
        { upsert: true, new: true }
      );

      return trivia;
    },
  },
}
