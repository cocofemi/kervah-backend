export const scenarioTypeDefs = `
type Scenario {
  id: ID!
  courseId: ID!
  title: String!
  instructions: String!
  rubric: [RubricCriterion!]!
  maxScore: Int!
  createdAt: String!
  updatedAt: String!
}


type RubricCriterion {
  id: ID!
  description: String!
  weight: Float!
}

type ScenarioSubmission {
  id: ID!
  scenario: Scenario!
  userId: ID!
  answer: String!
  aiScore: Float!
  aiFeedback: String!
  attemptNumber: Int!
  createdAt: String!
}

type ScenarioResponse {
scenario: Scenario!
}

type RubricCriterion {
  id: ID!
  description: String!
  weight: Float!
}

type ScenarioSubmission {
  id: ID!
  scenario: Scenario!
  userId: ID!
  answer: String!
  aiScore: Float!
  aiFeedback: String!
  attemptNumber: Int!
  createdAt: String!
}

input RubricCriterionInput {
  id: ID!
  description: String!
  weight: Float!
}

input CreateScenarioInput {
  courseId: ID!
  title: String!
  instructions: String!
  rubric: [RubricCriterionInput!]!
}

input UpdateScenarioInput {
  scenarioId: ID!
  title: String
  instructions: String
  rubric: [RubricCriterionInput!]
}

input SubmitScenarioAnswerInput {
  scenarioId: ID!
  answer: String!,
  businessId: ID!
}


extend type Query {
  scenarioByCourse(courseId: ID!): [Scenario!]!
  scenario(id: ID!): Scenario
  scenarios: [Scenario!]!
  scenarioSubmissions(scenarioId: ID!, userId: ID!): [ScenarioSubmission!]!
}

extend type Mutation {
  createScenario(input: CreateScenarioInput!): Scenario!
  updateScenario(input: UpdateScenarioInput!): Scenario!
  submitScenarioAnswer(input: SubmitScenarioAnswerInput!): ScenarioSubmission!
  deleteScenario(id: ID!): Boolean
}

`