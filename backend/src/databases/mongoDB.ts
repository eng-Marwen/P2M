import mongoose from "mongoose";

export const connectMongoDB = async () :Promise<void> => { //promise return nothing
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
    console.log("connected to mongoDB");
  } catch (error){
    console.log("Failed to connect to MongoDB , error message: ",(error as Error).message);
    process.exit(1);
  }
};
