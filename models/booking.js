const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    renter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rentalType: {
      type: String,
      enum: ["short-term", "long-term"],
      default: "short-term",
      required: true,
    },
    priceUnit: {
      type: String,
      enum: ["night", "month"],
      default: "night",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    guestCount: {
      type: Number,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    durationDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ listing: 1, status: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ renter: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });

bookingSchema.pre("validate", function (next) {
  if (this.rentalType === "short-term" && (!this.guestCount || this.guestCount < 1)) {
    this.guestCount = 1;
  }

  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    return next(new Error("End date must be later than start date"));
  }

  next();
});

bookingSchema.statics.expirePendingBookings = async function () {
  const threshold = new Date(Date.now() - 1000 * 60 * 60 * 48);

  const result = await this.updateMany(
    {
      status: "pending",
      createdAt: { $lt: threshold },
    },
    {
      $set: {
        status: "expired",
        respondedAt: new Date(),
      },
    },
  );

  return result.modifiedCount || 0;
};

bookingSchema.statics.findDateConflict = function ({ listingId, startDate, endDate, excludeId }) {
  const query = {
    listing: listingId,
    status: "approved",
    _id: { $ne: excludeId || null },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  };

  return this.findOne(query);
};

module.exports = mongoose.model("Booking", bookingSchema);
