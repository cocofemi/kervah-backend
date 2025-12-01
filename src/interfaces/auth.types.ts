export interface IForgotPassword {
    email: string
    otp: string
    success: boolean
}

export interface IResetPassword {
    success: boolean
}

export interface IGenerateOtp {
    email:string
    otp:string
    fname: string
}