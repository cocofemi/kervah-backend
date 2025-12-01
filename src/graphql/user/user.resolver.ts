import { User } from "../../models/user.model";
import { IUser, AuthResponse } from "../../interfaces/user.types";
import { generateJWT } from "../../utils/auth";
import * as jwt from "jsonwebtoken";
import { FastifyReply } from "fastify";

interface Context {
   auth: boolean;
   user?: { id: string };
   reply: FastifyReply
}

export const userResolver = {
    Query: { 
    users: async (_: any, __: any, ctx: Context): Promise<IUser[]> => {
      if (!ctx.auth) throw new Error("Unauthorized");
      const user = await User.findById(ctx.user)
      if(user?.role != "super-admin")throw new Error("Unauthorized");
      
      const users =  await User.find().populate({
        path: "businesses.business",
        select: "id name",
        })
        return users
    },
    user: async(_:any, __:any, ctx: Context): Promise<IUser | null> => {
        if (!ctx.auth) throw new Error("Unauthorized");
        return await User.findById(ctx.user).populate({
        path: "businesses.business",
        select: "id name",
        })
    },
    me: async(_:any, __:any, ctx: Context): Promise<IUser | null> => {
         if (!ctx.user) throw new Error("Unauthorized");
         return await User.findById(ctx.user.id).populate({
        path: "businesses.business",
        select: "id name",
        })
    }

},
Mutation :{
    register: async(_: any, {fname, lname, email, password }:
        {fname:string, lname:string, email:string, password:string, avatar?:string, 
            occupation:string, serviceType:string, role:string, bio?:string}
    ): Promise<AuthResponse | null> => {
        const existingUser = await User.findOne({ email});
        if (existingUser) throw new Error("User already exists");
        const user = new User({fname, lname, email, password})
        await user.save();
        const token = generateJWT({
            id: user._id,
            role: user.role,
            tokenType: 'access',
        },
        {
            issuer: user.email,
            subject: user.email,
            audience: 'root',
        })

         let tokenExpiration: any = new Date();
         tokenExpiration = tokenExpiration.setMinutes(
                tokenExpiration.getMinutes() + 10);
        return {token, user}
    },
    login: async(_: any, {email, password}: {email:string, password:string}, ctx:Context): Promise<AuthResponse | null> => {
        const user = await User.findOne({ email}).select("+password")
        .populate({
        path: "businesses.business",
        select: "id name",
        })
        console.log("User", user)
        console.log("Compare", await user?.comparePassword(password))
        if (!user || !(await user.comparePassword(password))) {
        throw new Error("Invalid credentials");
      }
      
      const sessionPayload = {
        user: { _id: user._id },
      };
      const sessionJwt = jwt.sign(
        sessionPayload,
        process.env.SESSION_SECRET ?? "supersecret",
        { expiresIn: "7d" }
      );

    ctx.reply.setCookie("backend_session", sessionJwt, {
        httpOnly: true,
        secure: false,    
        sameSite: "lax",
        path: "/",
        maxAge: 604800,     // 7 days
      });
      const token =  generateJWT({
            id: user._id,
            role: user.role,
            tokenType: 'access',
        },
        {
            issuer: user.email,
            subject: user.email,
            audience: 'root',
        })
        return {token, user}
    },
    updateUser: async(_:any, { fname, lname, email, avatar, occupation, serviceType, bio}: {id: string, fname:string, lname:string, email:string, avatar?:string, occupation:string, serviceType:string, bio?:string}, ctx: Context): Promise<IUser | null> => {
        if (!ctx.auth) throw new Error("Unauthorized");
        const checkUser = await User.findById(ctx.user);
        if (!checkUser) throw new Error("User doesn't exist");
        return await User.findByIdAndUpdate(ctx.user, { fname, lname, email, avatar, occupation, serviceType, bio }, { new: true });
    },
    deleteUser: async(_:any, {id}: {id: string}, ctx:Context): Promise<boolean> => {
        if (!ctx.auth) throw new Error("Unauthorized");
        const checkUser = await User.findById(id);
        if (!checkUser) throw new Error("User doesn't exist");
        await User.findByIdAndDelete(id);
        return true;
    }
}
}


