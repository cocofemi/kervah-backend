export const businessInviteTypeDefs = `
type BusinessInvite {
    id: ID!
    email: String!
    business: Business!
    role: String!
    token: String!
    status: String!
    invitedBy: User
    createdAt: String
    expiresAt: String
}

extend type Query {
  validateInvite(token: String!): BusinessInvite!
  businessInvites(businessId: ID!):[BusinessInvite]!
}

extend type Mutation {
  inviteBusinessMember(input: BusinessInviteInput!): BusinessInvite!
  acceptBusinessInvite(token: String!): BusinessInvite!
  revokeBusinessInvite(token: String!): BusinessInvite!
}

input BusinessInviteInput {
  businessId: ID!
  email: String!
  role: String!
}
`