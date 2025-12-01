export const assessmentTypeDef = `

type Assessment {
  id:ID!
  question: String!
  options: [String]
  correctAnswer: Int!
  explanation: String
  lessonId: ID!
  createdBy: User!
  createdAt: String
  updatedAt: String
}

type AssessmentResponse {
    assessment: Assessment!
}

type Query {
    assessments: [Assessment!]!
    assessment(id: ID!):Assessment!
    assessmentByCourse(courseId: ID!): [Assessment!]!
}

input AssessmentInput{
  question: String!
  options: [String]!
  correctAnswer: Int!
  explanation: String!
  lessonId:ID!
}

input UpdateAssessmentInput{
  assessmentId: ID!
  question: String
  options: [String]
  correctAnswer: Int
  explanation: String
}

extend type Mutation {
  createAssessment(input: AssessmentInput!):Assessment!
  updateAssessment(input: UpdateAssessmentInput!):Assessment!
  deleteAssessment(id: ID!):Boolean!
}
`