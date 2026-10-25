const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const Booking = require("./models/booking.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const { bookingSchema } = require("./schema.js");

const matchesUser = (record, userId) => {
  if (!record || !userId) return false;
  if (record._id && typeof record._id.equals === "function") {
    return record._id.equals(userId);
  }
  if (typeof record.equals === "function") {
    return record.equals(userId);
  }
  return String(record) === String(userId);
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Login required");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing || !matchesUser(listing.owner, res.locals.currUser._id)) {
    req.flash(
      "error",
      "Only owner has the permission to perform this operation",
    );
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review || !matchesUser(review.author, res.locals.currUser._id)) {
    req.flash(
      "error",
      "Only owner has the permission to perform this operation",
    );
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const optionalFields = ["bedrooms", "bathrooms", "squareFeet"];

  if (req.body.listing) {
    for (const field of optionalFields) {
      if (req.body.listing[field] === "") {
        delete req.body.listing[field];
      }
    }
  }

  const { error, value } = listingSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }

  const listingData = value.listing || {};
  if (listingData.rentalType === "short-term" && listingData.pricingUnit !== "night") {
    throw new ExpressError(400, "Short-term rentals must use a nightly price unit.");
  }
  if (listingData.rentalType === "long-term" && listingData.pricingUnit !== "month") {
    throw new ExpressError(400, "Long-term rentals must use a monthly price unit.");
  }

  req.body = value;
  next();
};

module.exports.validateBooking = async (req, res, next) => {
  const { error, value } = bookingSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }

  const bookingData = value.booking || {};
  const listing = await Listing.findById(bookingData.listingId);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  const listingType = listing.rentalType || "short-term";
  if (bookingData.rentalType !== listingType) {
    throw new ExpressError(400, "Rental type does not match the listing.");
  }

  if (listingType === "short-term" && (!bookingData.guestCount || bookingData.guestCount < 1)) {
    throw new ExpressError(400, "Guest count is required for short-term bookings.");
  }

  const startDate = new Date(bookingData.startDate);
  const endDate = new Date(bookingData.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new ExpressError(400, "Please provide valid booking dates.");
  }
  if (endDate <= startDate) {
    throw new ExpressError(400, "End date must be after the start date.");
  }
  if (startDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    throw new ExpressError(400, "Start date cannot be in the past.");
  }

  const conflict = await Booking.findDateConflict({
    listingId: bookingData.listingId,
    startDate,
    endDate,
  });

  if (conflict) {
    throw new ExpressError(409, "The selected dates conflict with an existing approved booking.");
  }

  req.body = value;
  next();
};

module.exports.validatereview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
