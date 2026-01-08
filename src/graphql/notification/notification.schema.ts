export const notificationTypeDefs = `

scalar JSON
scalar DateTime

enum NotificationType {
  INVITE_ACCEPTED
  COURSE_COMPLETED
  COURSE_PASSED
  COURSE_FAILED
  CERTIFICATE_ISSUED
  SUBSCRIPTION_SUCCESS
  UPGRADE_SUBSCRIPTION 
  CANCEL_SUBSCRIPTION

}

type Notification {
  id: ID!
  title: String!
  message: String!
  type: NotificationType!
  isRead: Boolean!
  data: JSON
  createdAt: String!
}

extend type Query {
  notificationsForUser: [Notification!]!
  notificationsForBusiness(businessId: ID!): [Notification!]!
}

extend type Mutation {
  markNotificationRead(notificationId: ID!): Notification!
  markAllNotificationsRead: Boolean!
  createNotification(input: CreateNotificationInput!): Notification!
}

input CreateNotificationInput {
  userId: ID
  businessId: ID
  title: String!
  message: String!
  type: String!
}

`