import { DailyTriviaAnswers } from "../../models/daily-trivia-answers.model";
import { SimulatedScenario } from "../../models/simulated-scenarios.model";

interface Context {
    auth: Boolean
    user: string
}

export const dailyTriviaAnswersResolvers = {
    Query : {
        hasAnsweredTrivia: async (_: any, { triviaId }: any, ctx: Context) => {
            if(!ctx.auth) throw new Error("Unauthorized");
            const answer = await DailyTriviaAnswers.findOne({
                triviaId,
                user: ctx.user,
            });
            return !!answer;
            }
    },
    Mutation: {
        answerDailyTrivia: async (_: any, { triviaId, businessId, isCorrect }: any, ctx: Context) => {
             if(!ctx.auth) throw new Error("Unauthorized");

            const update = {
                answeredAt: Date.now(),
                isCorrect
            };

            const updateSimulatedScenarios = {
                $inc: {
                total: 1,
                score: isCorrect ? 5 : 0,
                },
            };
            await SimulatedScenario.findOneAndUpdate({ user:ctx?.user, business:businessId },updateSimulatedScenarios,
                { new: true, upsert: true });
            const doc = await DailyTriviaAnswers.findOneAndUpdate({ triviaId, user:ctx?.user },update,
                { new: true, upsert: true }
            );
            const populatedDoc = await doc.populate("user");
            return populatedDoc;
        }
    }
}