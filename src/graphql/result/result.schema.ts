export const resultTypeDefs = `
    type Result {
        id: ID!
        userId: ID!
        courseId: ID!
        assessmentScore: Int!
        scenarioScore: Int!
        createdAt: String
        updatedAt: String 
    }

    type ResultResponse {
    result: Result!
    }

    type Query {
    results: [Result!]!
    resultByUser(userId: ID!): [Result!]!
    }

    type Mutation {
        createResult (
        userId: ID!
        courseId: ID!
        assessmentScore: Int!
        scenarioScore: Int!
        ):ResultResponse

        updateResult (
        userId: ID!
        assessmentScore: Int!
        scenarioScore: Int!): Result!
    }
`