export const authTypeDefs = `
  type ResetPayload {
    email: String!
    otp: String!
    success: Boolean!
  }

type VerifyOtpResponse {
  success: Boolean!
}

type GenerateOtpResponse {
  email: String!
  otp: String!
  fname: String!
}

type ResetPasswordResponse {
  success: Boolean!
}

type Mutation {
  forgotPassword(email: String!): ResetPayload!

  verifyOtp(email:String!, otp: String!): VerifyOtpResponse!
  generateOtp(email:String!, type:String!): GenerateOtpResponse!

  verifyEmail(
    email: String!
    otp: String!): VerifyOtpResponse!
  
  resetPassword(email: String!, newPassword: String!): ResetPasswordResponse!
  changePassword(oldPassword: String!, newPassword: String!): ResetPasswordResponse!
  }
`
