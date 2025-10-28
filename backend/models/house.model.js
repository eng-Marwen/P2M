import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Address Information
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "TN",
        trim: true,
      },
      // coordinates: {
      //   latitude: {
      //     type: Number,
      //     min: -90,
      //     max: 90
      //   },
      //   longitude: {
      //     type: Number,
      //     min: -180,
      //     max: 180
      //   }
      // }
      //////     !!!!! for the google maps
    },

    // Images
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          enum: [
            "exterior",
            "interior",
            "kitchen",
            "bedroom",
            "bathroom",
            "living_room",
            "other",
          ],
          default: "other",
        },
      },
    ],

    // Property Details
    propertyDetails: {
      bedrooms: {
        type: Number,
        required: true,
        min: 0,
      },
      bathrooms: {
        type: Number,
        required: true,
        min: 0,
      },
      squareFootage: {
        type: Number,
        min: 0,
      },
      propertyType: {
        type: String,
        enum: [
          "single_family",
          "condo",
          "townhouse",
          "duplex",
          "apartment",
          "mansion",
          "mobile_home",
          "other",
        ],
        required: true,
      },
    },

    // Financial Information
    pricing: {
      salePrice: {
        type: Number,
        min: 0,
      },
      rentPrice: {
        type: Number,
        min: 0,
      }
    },

    // Features and Amenities
    features: {
      hasGarage: {
        type: Boolean,
        default: false,
      },
      pool: {
        type: Boolean,
        default: false,
      },
      garden: {
        type: Boolean,
        default: false,
      },
      balcony: {
        type: Boolean,
        default: false,
      },
      airConditioning: {
        type: Boolean,
        default: false,
      },
      heating: {
        type: String,
        enum: ["gas", "electric", "oil", "solar", "none"],
        default: "none",
      },
      additionalFeatures: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // Status and Availability
    availability: {
      type: String,
      enum: ["for_sale", "for_rent", "sold", "rented", "off_market"],
      required: true,
      default: "off_market",
    },

    // Description
    description: {
      type: String,
      maxlength: 2000,
      trim: true,
    },

    // Contact Information
    contact: {
      agent: {
        name: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          trim: true,
        },
        email: {
          type: String,
          trim: true,
          lowercase: true,
        },
      },
      owner: {
        name: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          trim: true,
        },
      },
    },
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

export const House = mongoose.model("House", houseSchema, "houses");
