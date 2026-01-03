import mongoose from 'mongoose';

const specialPriceSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  });

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    description: String,

    city: {
      type: String,
      required: true
    },

    address: String,


    defaultPrice: {
      type: Number,
      required: true
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },


    specialPrices: [specialPriceSchema],

    photos: [String],

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

hotelSchema.index({ location: '2dsphere' });

export default mongoose.model('Hotel', hotelSchema);
