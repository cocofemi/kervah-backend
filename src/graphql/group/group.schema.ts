export const groupTypeDefs = `
type Group {
  id: ID!
  business: Business!
  name: String!
  description: String
  members: [User!]!
  courses: [Course!]!
  retakeIntervalMonths: Int
  createdAt: String
  updatedAt: String
}

extend type Query {
  groupsByUser(userId: ID!, businessId: ID!): [Group!]!
  groupsByBusiness(businessId: ID!): [Group!]!
  groupById(id: ID!): Group
}

extend type Mutation {
  createGroup(input: CreateGroupInput!): Group!
  editGroup(input: EditGroupInput!): Group!
  deleteGroup(groupId: ID!): Boolean!
  addMemberToGroup(input: AddGroupMemberInput!): Group!
  removeMemberFromGroup(input: RemoveGroupMemberInput!): Group!
  addCourseToGroup(input: AddGroupCourseInput!): [Group]!
  removeCourseFromGroup(input: RemoveGroupCourseInput!): Group!
}

input CreateGroupInput {
  businessId: ID!
  name: String!
  description: String
  retakeIntervalMonths: Int
  courseIds: [ID!]
}

input EditGroupInput {
  groupId: ID!
  name: String
  description: String
  retakeIntervalMonths: Int
}

input AddGroupMemberInput {
  groupId: ID!
  memberIds: [ID!]!
}

input RemoveGroupMemberInput {
  groupId: ID!
  memberIds: [ID!]!
}

input AddGroupCourseInput {
  groupIds: [ID!]!
  courseIds: [ID!]!
}

input RemoveGroupCourseInput {
  groupId: ID!
  courseIds: [ID!]!
}

`