const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  filename: String,
  url: { type: String, required: true }
}, { _id: false });

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: imageSchema, default: { filename: "listingimage", url: "https://plus.unsplash.com/premium_photo-1736194029417-bbf26867b462?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=800" } },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true }
});

module.exports = mongoose.model("Listing", listingSchema);