import mongoose from "mongoose";
const userSchma = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password:{
      type:String,
      required:true
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar:{
      type:String,
      default:"https://github.com/eng-Marwen/images/blob/main/unknown.png?raw=true"
    },
    address:{
      type:String,
      default:""
    },
    phone:{
      type:String,
      default:""
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
export const User=mongoose.model("User",userSchma,"Users");
