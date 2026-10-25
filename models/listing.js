const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");


const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: {
    url: String,
    filename: String,
  },
  price: { type: Number, required: true },
  rentalType: {
    type: String,
    enum: ["short-term", "long-term"],
    default: "short-term",
  },
  pricingUnit: {
    type: String,
    enum: ["night", "month"],
    default: "night",
  },
  bedrooms: { type: Number, min: 1, validate: Number.isInteger },
  bathrooms: { type: Number, min: 1, validate: Number.isInteger },
  squareFeet: { type: Number, min: 1, validate: Number.isInteger },
  location: { type: String, required: true },
  country: { type: String, required: true },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review",
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  bookingLock: {
    type: Schema.Types.ObjectId,
    default: null,
  },
});
listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
    await Review.deleteMany({ _id:{$in:listing.reviews}});
  }
})

module.exports = mongoose.model("Listing", listingSchema);