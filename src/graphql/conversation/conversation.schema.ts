export const converationTypeDefs = `
type Message {
  role: String!
  content: String!
  timestamp: String!
}

type Conversation {
  id: ID!
  title: String!
  messages: [Message!]!
  createdAt: String!
  updatedAt: String!
}

extend type User {
  conversations: [Conversation!]!
}

type Query {
  getConversation(conversationId: ID!): Conversation
  getUserConversations: [Conversation!]!
}

type Mutation {
  createConversation(firstMessage: String!): Conversation!
  appendMessage(conversationId: ID!, role: String!, content: String!): Boolean!
  deleteConversation(conversationId: ID!): Boolean!
}

`