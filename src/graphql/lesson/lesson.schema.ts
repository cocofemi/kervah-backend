export const lessonTypeDef = `
    type Lesson {
        id: ID!
        title:String!
        courseId:ID!
        videoUrl:String
        textContent:String
        assessments: [Assessment!]!
        createdBy: User!
        createdAt:String
        updatedAt:String
        }

    type Query {
        lessons: [Lesson!]!
        lesson(id: ID!):Lesson!
        lessonByCourse(courseId: ID!): [Lesson!]!
    }

    input LessonInput {
        title: String!
        courseId: ID!
        videoUrl:String
        textContent:String
    }

    input UpdateLessonInput {
        lessonId: ID!
        title: String
        videoUrl:String
        textContent:String
    }

    type Mutation {
        createLesson(input:LessonInput!): Lesson!
        updateLesson(input:UpdateLessonInput!): Lesson!
        deleteLesson(id: ID!):Boolean!
        
    }
`