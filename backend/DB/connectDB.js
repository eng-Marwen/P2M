import mongoose from "mongoose";
import dotenv from 'dotenv' //for accessing to strings in env file
dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("connected to db");
  } catch (error){
    console.log("failed to connect to db , error message: ",error.message);
    process.exit(1);
  }
};
