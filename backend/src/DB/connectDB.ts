import mongoose from "mongoose";

export const connectDB = async () :Promise<void> => { //promise return nothing
  try {
    await mongoose.connect(process.env.CONNECTION_STRING as string);
    console.log("Connected to DB");
  } catch (error){
    console.log("failed to connect to db , error message: ",(error as Error).message);
    process.exit(1);
  }
};
