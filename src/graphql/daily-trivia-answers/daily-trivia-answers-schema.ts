export const dailyTriviaAnswersTypeDefs = `
type DailyTriviaAnswers{
    id: ID!
    triviaId: ID!
    user: ID!
    answeredAt: String!
    isCorrect: Boolean!
}

type Query {
  hasAnsweredTrivia(triviaId: ID!): Boolean!
}
  type Mutation { 
    answerDailyTrivia(triviaId: ID!, businessId: ID!, isCorrect:Boolean!): DailyTriviaAnswers
  }
`