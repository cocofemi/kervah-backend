export const courseProgressTypeDefs = `
type CourseProgress {
  id: ID!
  user: User!
  business: Business
  course: Course!
  status: String
  score: Float
  startedAt: String
  lastLessonId: ID         # where the user stopped
  completedLessons: [ID!]  # lessons the user finished
  percentage: Float   
  completedAt: String
  lastUpdated: String
  createdAt: String
  updatedAt: String
}

type ResumeCourseResponse {
  lastLessonId: ID
  percentage: Float
  completedLessons: [ID!]!
  status: String!
}

type CourseWithProgress {
  course: Course!
  progress: CourseProgress
}

extend type Query {
  userCoursesWithProgress(businessId: ID!): [CourseWithProgress!]!
  courseProgressByGroup(groupId: ID!): [CourseProgress!]!
  userCourseProgressStatus(courseId: ID!, businessId: ID!): CourseProgress
  userCourseResults(businessId: ID!): [CourseProgress!]!
}

extend type Mutation {
  updateCourseProgress(input: UpdateCourseProgressInput!): CourseProgress!
  completeCourse(input: CompleteCourseInput!): CourseProgress!
  resumeCourse(courseId: ID!, businessId:ID!): ResumeCourseResponse!
  retakeCourse(courseId: ID!, businessId:ID!): ResumeCourseResponse!
  
}

input UpdateCourseProgressInput {
  courseId: ID!
  score: Int
  lastLessonId:ID!
  lessonId:ID!
  percentage: Float
}

input CompleteCourseInput {
  courseId:ID!
  scenarioId:ID!
}

`