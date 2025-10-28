import mongoose from "mongoose";
const userSchma = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    lastname: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password:{
      type:String,
      require:true
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date
  },
  {
    timestamps: true, //to automatically set createdAt and updatedAt fields
                    //"createdAt": "2025-07-22T16:00:00.000Z",
                    //"updatedAt": "2025-07-22T16:00:00.000Z",
  }
);
export const User=mongoose.model("User",userSchma,"users");
