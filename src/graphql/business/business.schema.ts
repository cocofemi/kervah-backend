export const businessTypeDefs = `
type Business {
  id: ID!
  name: String!
  phone: String!
  address: String!
  serviceType: String!
  ownerId: User!
  logo: String
  members: [Member!]!
  assignedCourses: [Course!]
  subscriptionPlan: String
  subscriptionStatus: Boolean
  createdAt: String
  updatedAt: String
}

type BusinessOverview {
  totalMembers: Int!
  totalCourses: Int!
  totalGroups: Int!
  totalCertificates: Int!
}


type Member {
  user: User!
  role: String!
  joined: String!
}

type User {
  id: ID!
  fname: String!
  lname: String!
  email: String!
}

type BusinessResponse {
  business: Business!
}

input AddMemberInput {
  businessId: ID!
  userId: ID!
  role: String = "member"  # default role
}

input AddCourseInput {
  businessId: ID!
  courseIds: [ID!]!
}

input RemoveCourseInput {
  businessId: ID!
  courseId: ID!
}

type BusinessLearningSummary {
  user: User!
  courses: [UserCourseSummary!]!
}

type UserCourseSummary {
  course: Course!
  progressId: String
  status: String
  completedAt: String
  score: Float
}

type Query {
  businesses: [Business!]!
  business(businessId: ID!): Business!
  businessCourses(businessId: ID!): [Course!]!
  businessOverview(businessId: ID!): BusinessOverview!
  businessLearningSummary(businessId: ID!): [BusinessLearningSummary!]!
}



  type Mutation {
    registerBusiness(
    name: String!
    phone: String!
    address: String!
    serviceType: String!
    logo: String
    subscriptionPlan: String
    subscriptionStatus: Boolean
    ): Business!

    updateBusiness(
    id: ID!
    name: String
    phone: String
    address: String
    serviceType: String
    logo: String
    subscriptionPlan: String
    subscriptionStatus: Boolean
    ): Business!

    addMemberToBusiness(input: AddMemberInput!): Business!
    changeMemberRole(input: AddMemberInput!): Business!
    removeMemberFromBusiness(input: AddMemberInput!): Business!

    addCourseToBusiness(input: AddCourseInput!): Business!
    removeCourseFromBusiness(input: RemoveCourseInput!): Business!
  }

`