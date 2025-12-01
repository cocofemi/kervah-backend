export const certificateTypeDefs = `
type Certificate {
  id: ID!
  certificateId: String!
  user: User!
  business: Business!
  course: Course!
  issueDate: String
  score: Float
  status: String
  downloadUrl: String
  createdAt: String
}

type UserCourseSummary {
  course: Course!
  progressStatus: String
  completedAt: String
  score: Float
  certificate: Certificate
}


extend type Query {
  certificatesByUser(businessId: ID): [Certificate!]!
  certificatesByBusiness(businessId: ID!): [Certificate!]!
  certificateById(id: ID!): Certificate
  userCoursesWithCertificates(businessId: ID!): [UserCourseSummary!]!

}

extend type Mutation {
  issueCertificate(input: IssueCertificateInput!): Certificate!
  revokeCertificate(certificateId: ID!): Certificate!
}

input IssueCertificateInput {
  businessId: ID!
  courseId: ID!
}

`