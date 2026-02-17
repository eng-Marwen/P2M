import mongoose from "mongoose";

export const connectToMongoDB = async () :Promise<void> => { //promise return nothing
  try {
    await mongoose.connect(process.env.CONNECTION_STRING as string);
    console.log("Connected to mongoDB");
  } catch (error){
    console.log("failed to connect to db , error message: ",(error as Error).message);
    process.exit(1);
  }
};
