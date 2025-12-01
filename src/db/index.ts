require('dotenv').config({path:'../.env'})
import mongoose from "mongoose";

//CONNECTION TO MONGOOSE DATABASE
export async function connectDB() {
  mongoose
    .connect(process.env.MONGO_URL as string)
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error:string) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

