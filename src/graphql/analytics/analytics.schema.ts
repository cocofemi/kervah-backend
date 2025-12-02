export const analyticsTypeDef = `
type FunnelMetrics {
  started: Int
  quarter: Int
  half: Int
  threeQuarter: Int
  completedLessons: Int
  scenarioSubmitted: Int
  passed: Int
  certificatesIssued: Int
}

type EngagementOverTime {
    date: String
    Course_Starts: Int
    Lesson_Completions: Int
    Scenario_Submissions: Int
}

enum ActivityType {
  course_start
  course_complete
  member_joined
}

type RecentActivity {
  id: ID!
  userName: String!
  action: String!
  target: String!
  type: ActivityType!
  timestamp: String!
}

type UserCoursePerformance {
  courseId: ID!
  courseName: String!
  completionRate: Int!
  score: Float
}

type UserPerformance {
  userId: ID!
  userName: String!
  courses: [UserCoursePerformance!]!
}


extend type Query {
  recentActivities(
    businessId: ID!
    limit: Int
  ): [RecentActivity!]!
}


type Query {
    courseFunnel(courseId: ID!, businessId: ID!): FunnelMetrics!
    engagementOverTime(businessId: ID!, days: Int!): [EngagementOverTime!]!
    userPerformance(businessId: ID!, userId: ID!): UserPerformance!
    businessUsersPerformance(businessId: ID!): [UserPerformance!]!
}
`