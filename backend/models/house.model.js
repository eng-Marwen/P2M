import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
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
    offer: { type: Boolean,required: true  },
    userRef:{
      type:  mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    area: Number,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Virtual for full address
// houseSchema.virtual('fullAddress').get(function() {
//   return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
// });

// Static method to find houses by city
// houseSchema.statics.findByCity = function(city) {
//   return this.find({ 'address.city': new RegExp(city, 'i') });
// };

// Instance method to get price range
// houseSchema.methods.getPriceInfo = function() {
//   return {
//     sale: this.pricing.salePrice || null,
//     rent: this.pricing.rentPrice || null,
//     estimated: this.pricing.estimatedValue || null,
//     currency: this.pricing.currency
//   };
// };

const House = mongoose.model("House", houseSchema, "houses");
export default House;
