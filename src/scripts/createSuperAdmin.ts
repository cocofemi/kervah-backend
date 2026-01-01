require('dotenv').config({path:'../.env'})
import { User } from "../models/user.model";
import { Business } from "../models/business.model";
import mongoose from "mongoose";

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        
        await mongoose.connect(process.env.MONGO_URL!);

        console.log("Connected.");

        const res = await User.create({

            role: 'super-admin',
            fname: "Kervah",
            lname: "Super-Admin",
            occupation:"Platform-Owner",
            serviceType:"Administrator",
            bio:"Building the best LMS system for the care and support industry ",
            emailVerified: true
        });

        const business = await Business.create({
            name: "Kervah Administrator",
            phone: "+447545485343",
            address: "15 Wellington Kervah close",
            ownerId: res?._id,
            serviceType: "BOTH",
            members: [{user: res?._id, role: "super-admin", joined: new Date(Date.now()) }]
        })

        const updateUser = await User.findById(res?._id)

        if (updateUser) {
            updateUser.businesses = [{business:business?._id, role: "super-admin" }]
            await updateUser.save()
        }

        console.log("Super admin created!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
