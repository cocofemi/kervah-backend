import { Scenario } from "../../models/scenario.model";
import { IScenario } from "../../interfaces/scenario.types";
import { User } from "../../models/user.model";
import { gradeScenarioAnswerWithGroq } from "../../lib/groqGrader";
import { ScenarioSubmission } from "../../models/scenarioSubmission.model";
import { Course } from "../../models/course.model";

interface Context {
    auth: boolean;
    user?: {id: string};
}

export const scenarioResolver = {
    Query: {
        scenarios: async (_: any, __: any, ctx: Context): Promise<IScenario[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Scenario.find();
        },
        scenario: async (_: any, {id}:{id: string}, ctx: Context): Promise<IScenario | null> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Scenario.findById(id);
        },
        scenarioByCourse: async(_:any, {courseId}:{courseId:string}, ctx: Context): Promise<IScenario[]> => {
            if (!ctx.auth) throw new Error("Unauthorized");
                return await Scenario.find({courseId})
        },
           
    scenarioSubmissions: async (
      _: any,
      { scenarioId, userId }: { scenarioId: string; userId: string }
    ) => {
      return ScenarioSubmission.find({ scenarioId, userId }).sort({ createdAt: -1 });
    },
    },

    Mutation : {
     createScenario: async (_: any, { input }: any, ctx: Context) => {
      if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

      const superAdmin = await User.findById(ctx?.user)
      if(!superAdmin || superAdmin.role !== 'super-admin')
        throw new Error("Only super-admins can create scenarios")

      const scenario = await Scenario.create({
        courseId: input.courseId,
        title: input.title,
        instructions: input.instructions,
        rubric: input.rubric,
        maxScore: input.maxScore,
        // maxAttempts: input.maxAttempts,
      });

      await Course.findByIdAndUpdate(input.courseId,{ scenarios: scenario._id });

      return scenario;
    },

    updateScenario: async (_: any, { input }: any, ctx: Context) => {
      if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

      const superAdmin = await User.findById(ctx?.user)
      if(!superAdmin || superAdmin.role !== 'super-admin')
        throw new Error("Only super-admins can create scenarios")

      const { scenarioId, ...update } = input;

      const checkScenario = await Scenario.findById(scenarioId)
      if (!checkScenario) throw new Error("Scenario not found")

      const scenario = await Scenario.findByIdAndUpdate(
        scenarioId,
        { $set: update },
        { new: true }
      );

      if (!scenario) throw new Error("Scenario not found");

      return scenario;
    },

    submitScenarioAnswer: async (
      _: any,
      { input }: any,
      ctx: Context
    ) => {
      if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");

      const { scenarioId, answer, businessId } = input;

      const scenario = await Scenario.findById(scenarioId);
      if (!scenario) throw new Error("Scenario not found");

      // Enforce maxAttempts per user per scenario
      const existingAttempts = await ScenarioSubmission.countDocuments({
        scenarioId,
        userId: ctx.user,
      });

    //   if (existingAttempts >= scenario.maxAttempts) {
    //     throw new Error("Maximum attempts reached for this scenario");
    //   }

      // Grade using Groq
      const grade = await gradeScenarioAnswerWithGroq(scenario, answer);

      const submission = await ScenarioSubmission
      .create({
        scenarioId,
        userId: ctx.user,
        businessId,
        answer,
        aiScore: grade.score,
        aiFeedback: grade.feedback,
        attemptNumber: existingAttempts + 1,
      });

      const populatedSubmission = ScenarioSubmission.findById(submission._id)
        .populate("userId scenarioId")

      return populatedSubmission;
    },
     deleteScenario: async(_:any, {id}: {id: string}, ctx:Context): Promise<boolean> => {
        const scenario = await Scenario.findById(id)
        if(!scenario) throw new Error("Scenario does not exist");
        
        const superAdmin = await User.findById(ctx?.user)
        if(!superAdmin || superAdmin.role !== 'super-admin' && !ctx.auth ){
            throw new Error("Only super-admins can delete scenario")
        }

        const course = await Course.findById(scenario?.courseId)

        if (course) {
            course.scenarios = null
            await course.save();
        }


        await Scenario.findByIdAndDelete(id)
        return true
    },
  },

    ScenarioSubmission: {
        scenario: (parent: any) => Scenario.findById(parent.scenarioId),
    },
}
    
