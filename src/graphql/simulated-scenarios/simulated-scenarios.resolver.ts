import { SimulatedScenario } from "../../models/simulated-scenarios.model";

interface Context {
    auth: boolean
    user: string
}

export const simulatedScenarioResolver = {
    Query: {
        mySimulationScore: async (_: any, { businessId }: any, ctx: Context) => {
            if(!ctx.auth || !ctx.user) throw new Error("Unauthorized");

            const simulatedScenario = await SimulatedScenario.findOne({user: ctx.user, business: businessId})
            .populate("user business")

            return simulatedScenario
        },

        leaderboard: async (_: any, { businessId }: any, ctx:Context) => {
            if(!ctx.auth) throw new Error("Unauthorized");
            return SimulatedScenario.find({business:  businessId })
                    .populate("user")
                    .sort({ score: -1, total: -1 })
                    .limit(50);
        },
    },

    Mutation: {
        recordScenarioResult: async (_: any, { businessId, isCorrect }: {businessId: string, isCorrect: boolean}, ctx: Context) => {
            if(!ctx.auth) throw new Error("Unauthorized");
            const update = {
                $inc: {
                total: 1,
                score: isCorrect ? 1 : 0,
                },
            };
            const doc = await SimulatedScenario.findOneAndUpdate({ user:ctx?.user, business:businessId },update,
                { new: true, upsert: true }
            );
            const populatedDoc = await doc.populate("user business");
            return populatedDoc;
        },
    }
}