export const policyTypeDefs = `
type PolicyDocument {
  id: ID!
  documentUrl: String!
  name: String!
  category: String!
  description: String
  fileType: String
  fileSize: String
  uploadedBy: User
  businessId: Business!
  createdAt: String
  updateAt: String
}

input PolicyDocumentInput {
    documentUrl: String!
    name: String!
    category: String!
    description: String
    fileType: String
    fileSize: String
    businessId: ID!
}

extend type Query {
    businessPolicyDocument(businessId: ID!): [PolicyDocument!]!
}

extend type Mutation {
    uploadPolicy(input:PolicyDocumentInput!): PolicyDocument!
    removePolicyDocument(documentId: ID!): Boolean!
}
`