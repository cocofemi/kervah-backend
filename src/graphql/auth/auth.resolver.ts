import { User } from "../../models/user.model";
import { IForgotPassword, IGenerateOtp, IResetPassword } from "../../interfaces/auth.types";
import { generateOtp, verifyOtp } from "../../utils/auth";
import otpMaster from "../../models/otp.model"
import { OtpType } from "../../utils/enums";

interface Context {
   auth: boolean;
   user?:  string ;
}



export const authResolver = {
    Mutation: {
        forgotPassword: async(_:any, {email}: {email:string}): Promise<IForgotPassword | null> => {
            const user  = await User.findOne({email})
            if (!user) throw new Error("User not found");

            let tokenExpiration: any = new Date();
            tokenExpiration = tokenExpiration.setMinutes(
                tokenExpiration.getMinutes() + 10
            );

            let otp = generateOtp(6)

            let newOtp = new otpMaster({
                userId: user._id,
                type: OtpType.FORGET,
                otp,
                otpExpiration: new Date(tokenExpiration),
            });
            await newOtp.save();
            // send email in real-world scenario
            console.log(`Password reset link: http://localhost:4000/reset/${otp}`);

            return{email, otp, success: true}
        },
        
        verifyEmail: async(_:any, {email, otp}: {email:string, otp:string}): Promise<IResetPassword | null> => {
            const user  = await User.findOne({email})
            if (!user) throw new Error("User not found");
            let isOtpValid = await verifyOtp(user._id, otp, OtpType.VERIFICATION);

            if (!isOtpValid) {
                throw new Error("Invalid or expired OTP");
            }
            await User.findByIdAndUpdate(user._id, { emailVerified: true }, { new: true });
            await otpMaster.findByIdAndDelete(isOtpValid);
            return {success: true}
        },

         generateOtp: async(_:any, {email, type}: {email:string, type:string}): Promise<IGenerateOtp | null> => {
           const user  = await User.findOne({email})
           let otp = generateOtp(6)

           let tokenExpiration: any = new Date();
            tokenExpiration = tokenExpiration.setMinutes(
            tokenExpiration.getMinutes() + 10
            );

            if (type === "verification") {
            let newOtp = new otpMaster({
                userId: user?._id,
                type: OtpType.VERIFICATION,
                otp,
                otpExpiration: new Date(tokenExpiration),
            });
            await newOtp.save();
            }

            if (type === "invite") {
                let otp = generateOtp(6)

                let newOtp = new otpMaster({
                    userId: user?._id,
                    type: OtpType.INVITE,
                    otp,
                    otpExpiration: new Date(tokenExpiration),
                });
                await newOtp.save();
            }

            if (type === "forget") {
                let otp = generateOtp(6)

                let newOtp = new otpMaster({
                    userId: user?._id,
                    type: OtpType.FORGET,
                    otp,
                    otpExpiration: new Date(tokenExpiration),
                });
                await newOtp.save();
            }

            return {email, otp, fname: user ? user.fname :''}
    },

        verifyOtp: async(_:any, {email, otp}: {email:string, otp:string}): Promise<IResetPassword | null> => {
            const user  = await User.findOne({email})
            if (!user) throw new Error("User not found");
            let isOtpValid = await verifyOtp(user._id, otp, OtpType.FORGET);

            if (!isOtpValid) {
                throw new Error("Invalid or expired OTP");
            }
            await otpMaster.findByIdAndDelete(isOtpValid);
            return {success: true}
        },
        
        resetPassword: async(_:any, {email, newPassword}: {email:string, newPassword:string}): Promise<IResetPassword | null> => {
            const user  = await User.findOne({email})
            if (!user) throw new Error("User not found");
            // let isOtpValid = await verifyOtp(user._id, otp, OtpType.FORGET);
            
            user.password = newPassword;
            await user.save();

            // await otpMaster.findByIdAndDelete(isOtpValid);
            return {success: true}
        },

        changePassword: async(_:any, { oldPassword, newPassword}: { 
            oldPassword:string, newPassword:string}, ctx:Context): Promise<IResetPassword | null> => {
            if (!ctx.auth) throw new Error("Unauthorized");
            const user  = await User.findById(ctx.user).select("+password")
            if (!user) throw new Error("User not found");

            if (!user || !(await user.comparePassword(oldPassword))) {
                throw new Error("Invalid credentials");
            }

            user.password = newPassword;
            await user.save();
            return {success: true}
        }
    }
}