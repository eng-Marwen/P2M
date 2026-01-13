import mongoose, { Document, Schema, Types } from "mongoose";

export interface IHouse extends Document {
  _id:Types.ObjectId
  name: string;
  description: string;
  address: string;
  regularPrice: number;
  discountedPrice?: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  parking: boolean;
  type: "rent" | "sale";
  offer: boolean;
  userRef: Types.ObjectId;
  area?: number;
  createdAt: Date;
  updatedAt: Date;
}

const houseSchema: Schema<IHouse> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: {
      type: String,
      required: true,
    },
    regularPrice: { type: Number, required: true },
    discountedPrice: { type: Number },
    images: [{ type: String }], // Array of image URLs
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    furnished: { type: Boolean, required: true },
    parking: { type: Boolean, required: true },
    type: { type: String, enum: ["rent", "sale"], required: true }, // rent or sale
    offer: { type: Boolean, required: true },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    area: Number,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const House = mongoose.model<IHouse>("House", houseSchema, "houses");
export default House;
