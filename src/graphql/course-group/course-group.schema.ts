export const courseGroupTypeDef = ` 
type CourseGroup {
    id: ID!
    name: String!
    description: String
    courses: [Course!]!
    createdAt:String
    updatedAt:String
}


input CreateCourseGroupInput {
    name: String!
    description: String
    courseIds: [ID!]!
}


input UpdateCourseGroupInput {
    id: ID!
    name: String
    description: String
    courseIds: [ID!]
}


type Query {
    courseGroup(id: ID!): CourseGroup
    courseGroups: [CourseGroup!]!
}


type Mutation {
    createCourseGroup(input: CreateCourseGroupInput!): CourseGroup!
    updateCourseGroup(input: UpdateCourseGroupInput!): CourseGroup!
    deleteCourseGroup(id: ID!): Boolean!
}
`