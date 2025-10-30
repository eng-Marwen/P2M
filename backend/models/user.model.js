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
      default:"https://www.google.com/imgres?q=unknown%20profile%20pic&imgurl=https%3A%2F%2Fas1.ftcdn.net%2Fjpg%2F03%2F53%2F11%2F00%2F1000_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fimages%2Fdefault-avatar-profile-flat-icon-social-media-user-vector-portrait-of-unknown-a-human-image%2F353110097&docid=9ntBPgPbHGyp8M&tbnid=e4x1eI-jGj2aaM&vet=12ahUKEwi8w_bTlsyQAxVggP0HHSYfMRUQM3oECC4QAA..i&w=1000&h=1000&hcb=2&ved=2ahUKEwi8w_bTlsyQAxVggP0HHSYfMRUQM3oECC4QAA"
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
