export const dailyTriviaTypeDefs = `
type TriviaQuestion {
  id: ID!
  question: String!
  options: [String!]!
  correctAnswer: Int!
  explanation: String!
  category: String!
}

type Query {
  dailyTrivia(id: ID!): TriviaQuestion
  todaysTrivia: TriviaQuestion
}

type Mutation {
  createDailyTrivia(
    id: ID!
    question: String!
    options: [String!]!
    correctAnswer: Int!
    explanation: String!
    category: String!
  ): TriviaQuestion!
}

`