import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { userTypeDefs } from "./user/user.schema";
import { userResolver } from "./user/user.resolver";
import { authTypeDefs } from "./auth/auth.schema";
import { authResolver } from "./auth/auth.resolver";
import { businessTypeDefs } from "./business/business.schema";
import { businessResolver } from "./business/business.resolver";
import { courseTypeDef } from "./course/course.schema";
import { courseResolver } from "./course/course.resolver";
import { lessonTypeDef } from "./lesson/lesson.schema";
import { lessonResolver } from "./lesson/lesson.resolver";
import { assessmentTypeDef } from "./assessment/assessment.schema";
import { assessmentResolver } from "./assessment/assessment.resolver";
import { scenarioTypeDefs } from "./scenario/scenario.schema";
import { scenarioResolver } from "./scenario/scenario.resolver";
import { resultTypeDefs } from "./result/result.schema";
import { resultResolver } from "./result/result.resolver";
import { groupTypeDefs } from "./group/group.schema";
import { groupResolver } from "./group/group.resolver";
import { courseProgressTypeDefs } from "./course-progress/course-progress.schema";
import { courseProgressResolver } from "./course-progress/course-progress.resolver";
import { certificateTypeDefs } from "./certification/certification.schema";
import { certificateResolver } from "./certification/certification.resolver";
import { notificationTypeDefs } from "./notification/notification.schema";
import { notificationResolver } from "./notification/notification.resolver";
import { businessInviteTypeDefs } from "./business-invite/business-invite.schema";
import { businessInviteResolver } from "./business-invite/business-invite.resolver";
import { analyticsTypeDef } from "./analytics/analytics.schema";
import { analyticsResolver } from "./analytics/analytics.resolver";
import { converationTypeDefs } from "./conversation/conversation.schema";
import { conversationResolver } from "./conversation/conversation.resolver";
import { courseGroupTypeDef } from "./course-group/course-group.schema";
import { courseGroupResolver } from "./course-group/course-group.resolver";
import { policyTypeDefs } from "./policy/policy.schema";
import { policyDocumentResolvers } from "./policy/policy.resolver";

const typeDefs = mergeTypeDefs([userTypeDefs, authTypeDefs, 
  businessTypeDefs, courseTypeDef, lessonTypeDef,
assessmentTypeDef, scenarioTypeDefs, resultTypeDefs,
groupTypeDefs, courseProgressTypeDefs, certificateTypeDefs,
notificationTypeDefs, businessInviteTypeDefs, analyticsTypeDef,
converationTypeDefs, courseGroupTypeDef, policyTypeDefs]);
const resolvers = mergeResolvers([userResolver, authResolver, 
  businessResolver, courseResolver, lessonResolver,
assessmentResolver, scenarioResolver, resultResolver,
groupResolver, courseProgressResolver, certificateResolver,
notificationResolver, businessInviteResolver, analyticsResolver,
conversationResolver, courseGroupResolver, policyDocumentResolvers]);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

