import * as jwt from "jsonwebtoken";
import otpMaster from "../models/otp.model"
require('dotenv').config({path:'../.env'})

const SECRET = process.env.JWT_SECRET || "supersecret";

export interface JwtPayload {
  id: string;
}

const generateJWT = function (
    payload: object = {},
    options: object = {}
): string {
    const privateKey: any = process.env.JWT_SECRET;
    const defaultOptions: object = {
        expiresIn: '17d',
    };

    return jwt.sign(
        payload,
        privateKey,
        Object.assign(defaultOptions, options)
    );
};

const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

//GENERATE OTP
const generateOtp = function (len: number): string {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < len; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }

    return OTP;
};

//VERIFY GENERATED OTP
const verifyOtp = async function (
    userId: any,
    otp: string,
    type: string
): Promise<any> {
    let existOtp = await otpMaster.findOne({
        userId,
        otp,
        type,
    });
    const currentDate = new Date();
    // ensure existOtp and its expiration are present before comparing
    const otpExpiration = existOtp?.otpExpiration ?? null;
    if (!existOtp || !otpExpiration || otpExpiration < currentDate) {
        return null;
    }

    return existOtp._id;
};


export {generateJWT, verifyToken, generateOtp, verifyOtp}