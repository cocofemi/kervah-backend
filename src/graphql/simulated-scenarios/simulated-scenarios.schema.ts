export const simulatedScenarioTypeDef = `
type SimulatedScenario {
  id: ID!
  user: User!
  business: Business!
  score: Int!
  total: Int!
}

type LeaderboardRow {
  id: ID!
  user: User!
  score: Int!
  total: Int!
}

type Query {
  mySimulationScore(businessId: ID!): SimulatedScenario
  leaderboard(businessId: ID!): [LeaderboardRow!]!
}

type Mutation {
  recordScenarioResult(businessId: ID!, isCorrect: Boolean!): SimulatedScenario!
}

`