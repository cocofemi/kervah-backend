export const userTypeDefs = `
  type User {
    id: ID!
    fname: String!
    lname: String!
    email: String
    avatar: String
    occupation: String
    serviceType: String
    role: String
    bio: String
    emailVerified: Boolean
    businesses: [BusinessRole!]
    createdAt: String
    updatedAt: String
  }
    

  type AuthPayload {
    token: String!
    user: User!
  }

  type BusinessRole {
    business: Business!
    role: String!
  }

  type Business {
    id: ID
    name: String!
  }

input PaginationInput {
  page: Int = 1
  limit: Int = 10
}

type PaginationMeta {
  total: Int!
  page: Int!
  limit: Int!
  totalPages: Int!
  hasNextPage: Boolean!
  hasPrevPage: Boolean!
}

type PaginatedUsers {
  data: [User!]!
  meta: PaginationMeta!
}


  type Query {
    users(pagination: PaginationInput): PaginatedUsers!
    user: User!
    me: User
  }

  type Mutation {
    register(
    fname: String!,
    lname: String!,
    email: String!, 
    password: String!,
    avatar: String,
    occupation: String,
    serviceType: String,
    role: String,
    bio: String): AuthPayload!

    login(email: String!, password: String!): AuthPayload!

    updateUser(
    fname: String, 
    lname: String,
    avatar: String,
    occupation: String,
    serviceType: String,
    bio: String): User!

    deleteUser(id: ID!): Boolean!
  }
`;
