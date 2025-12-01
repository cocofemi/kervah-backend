export const courseTypeDef = `
    type Course {
        id: ID!
        title: String!
        description: String!
        category: String!
        thumbnail: String
        duration: String!
        lessons: [Lesson!]
        scenarios: Scenario
        publish: Boolean
        archive:Boolean
        createdBy: User!
        createdAt: String
        updatedAt: String
    }

    input UpdateCourseInput {
        id: ID!
        title: String
        description: String
        category: String
        thumbnail: String
        duration: String
        publish:Boolean
        archive: Boolean
    }

    type Query {
        courses: [Course!]!
        course(id: ID!):Course
    }
    type Mutation {
        createCourse(
        title: String!
        description: String!
        category: String!
        thumbnail: String
        duration: String!
        ): Course!

        updateCourse(input:UpdateCourseInput): Course!
    }
`