const mongoose = require("mongoose");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

const normalizeListingType = (listing) => listing?.rentalType || "short-term";
const normalizePricingUnit = (listing, rentalType) => listing?.pricingUnit || (rentalType === "long-term" ? "month" : "night");

const computeBookingSummary = (listing, rentalType, startDate, endDate) => {
  const totalDays = Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / DAY_IN_MS));

  if (rentalType === "short-term") {
    return {
      durationDays: totalDays,
      estimatedTotal: Number((listing.price * totalDays).toFixed(2)),
    };
  }

  const monthEstimate = totalDays / 30;
  return {
    durationDays: totalDays,
    estimatedTotal: Number((listing.price * monthEstimate).toFixed(2)),
  };
};

const parseBookingInput = (body = {}) => {
  const data = body.booking || body;

  return {
    listingId: data.listingId || data.listing || data.listing_id,
    rentalType: data.rentalType || "short-term",
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    guestCount: data.guestCount ? Number(data.guestCount) : 1,
  };
};

const ensureAllowedBookingState = (booking) => {
  if (!booking) {
    return false;
  }

  if (booking.status === "expired") {
    return false;
  }

  return ["pending", "approved"].includes(booking.status);
};

module.exports.renderBookingForm = async (req, res) => {
  const { listingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new ExpressError(400, "Invalid listing ID");
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  if (listing.owner && req.user && matchesUser(listing.owner, req.user._id)) {
    req.flash("error", "You cannot book your own property");
    return res.redirect(`/listings/${listing._id}`);
  }

  const rentalType = normalizeListingType(listing);
  const priceUnit = normalizePricingUnit(listing, rentalType);
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  res.render("bookings/new.ejs", {
    listing,
    rentalType,
    priceUnit,
    minDate: minDate.toISOString().split("T")[0],
  });
};

module.exports.createBooking = async (req, res) => {
  const payload = parseBookingInput(req.body);

  if (!payload.listingId || !mongoose.Types.ObjectId.isValid(payload.listingId)) {
    throw new ExpressError(400, "Invalid listing ID");
  }

  const listing = await Listing.findById(payload.listingId);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  if (listing.owner && matchesUser(listing.owner, req.user._id)) {
    req.flash("error", "You cannot book your own property");
    return res.redirect(`/listings/${listing._id}`);
  }

  const rentalType = normalizeListingType(listing);
  if (payload.rentalType !== rentalType) {
    throw new ExpressError(400, "Rental type does not match the listing");
  }

  if (!payload.startDate || !payload.endDate) {
    throw new ExpressError(400, "Please provide valid booking dates");
  }

  if (payload.endDate <= payload.startDate) {
    throw new ExpressError(400, "End date must be later than the start date");
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  if (payload.startDate < today) {
    throw new ExpressError(400, "Start date cannot be in the past");
  }

  if (rentalType === "short-term") {
    const guestCount = Number(payload.guestCount);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      throw new ExpressError(400, "Valid guest count is required");
    }
  }

  const summary = computeBookingSummary(listing, rentalType, payload.startDate, payload.endDate);
  if (summary.durationDays <= 0) {
    throw new ExpressError(400, "Booking duration must be at least one day");
  }

  const existingPending = await Booking.findOne({
    listing: listing._id,
    renter: req.user._id,
    rentalType,
    startDate: payload.startDate,
    endDate: payload.endDate,
    status: "pending",
  });

  if (existingPending) {
    req.flash("error", "A matching booking request already exists.");
    return res.redirect("/bookings/mine");
  }

  const conflict = await Booking.findDateConflict({
    listingId: listing._id,
    startDate: payload.startDate,
    endDate: payload.endDate,
  });

  if (conflict) {
    req.flash("error", "Those dates are not available for this listing");
    return res.redirect(`/listings/${listing._id}`);
  }

  const priceUnit = normalizePricingUnit(listing, rentalType);
  const booking = new Booking({
    listing: listing._id,
    renter: req.user._id,
    owner: listing.owner,
    rentalType,
    startDate: payload.startDate,
    endDate: payload.endDate,
    guestCount: rentalType === "short-term" ? Number(payload.guestCount) : 1,
    status: "pending",
    pricePerUnit: listing.price,
    priceSnapshot: listing.price,
    priceUnit,
    durationDays: summary.durationDays,
    estimatedTotal: summary.estimatedTotal,
  });

  await booking.save();
  req.flash("success", "Booking request submitted successfully");
  res.redirect("/bookings/mine");
};

module.exports.renderMyBookings = async (req, res) => {
  await Booking.expirePendingBookings();

  const bookings = await Booking.find({ renter: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/mine.ejs", { bookings });
};

module.exports.renderOwnerBookings = async (req, res) => {
  await Booking.expirePendingBookings();

  const listings = await Listing.find({ owner: req.user._id }).select("_id title");
  const listingIds = listings.map((listing) => listing._id);

  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate("listing")
    .populate("renter")
    .sort({ createdAt: -1 });

  res.render("bookings/manage.ejs", { bookings, listings });
};

module.exports.approveBooking = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid booking ID");
  }

  await Booking.expirePendingBookings();

  const booking = await Booking.findById(id).populate("listing");
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings/manage");
  }

  if (!booking.listing || !booking.listing.owner || !matchesUser(booking.listing.owner, req.user._id)) {
    req.flash("error", "You can only approve requests for your listings");
    return res.redirect("/bookings/manage");
  }

  if (booking.status !== "pending") {
    req.flash("error", "Only pending bookings can be approved");
    return res.redirect("/bookings/manage");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const lockId = new mongoose.Types.ObjectId();
      const lockUpdate = await Listing.updateOne(
        {
          _id: booking.listing._id,
          $or: [{ bookingLock: null }, { bookingLock: { $exists: false } }],
        },
        { $set: { bookingLock: lockId } },
        { session },
      );

      if (lockUpdate.matchedCount === 0) {
        throw new ExpressError(409, "Another approval for this property is already being processed");
      }

      const conflict = await Booking.findDateConflict({
        listingId: booking.listing._id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        excludeId: booking._id,
      }).session(session);

      if (conflict) {
        throw new ExpressError(409, "Requested dates conflict with an approved booking");
      }

      booking.status = "approved";
      booking.respondedAt = new Date();
      await booking.save({ session });

      await Listing.updateOne(
        { _id: booking.listing._id, bookingLock: lockId },
        { $unset: { bookingLock: "" } },
        { session },
      );
    });

    req.flash("success", "Booking request approved");
  } catch (error) {
    const message = error && error.message ? error.message : "Approval failed";
    req.flash("error", message);
  } finally {
    await session.endSession();
  }

  return res.redirect("/bookings/manage");
};

module.exports.rejectBooking = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid booking ID");
  }

  const booking = await Booking.findById(id).populate("listing");
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings/manage");
  }

  if (!booking.listing || !booking.listing.owner || !matchesUser(booking.listing.owner, req.user._id)) {
    req.flash("error", "You can only reject requests for your listings");
    return res.redirect("/bookings/manage");
  }

  if (booking.status !== "pending") {
    req.flash("error", "Only pending bookings can be rejected");
    return res.redirect("/bookings/manage");
  }

  booking.status = "rejected";
  booking.respondedAt = new Date();
  await booking.save();

  req.flash("success", "Booking request rejected");
  res.redirect("/bookings/manage");
};

module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid booking ID");
  }

  const booking = await Booking.findById(id).populate("listing");
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings/mine");
  }

  if (!booking.renter || !matchesUser(booking.renter, req.user._id)) {
    req.flash("error", "You can only cancel your own bookings");
    return res.redirect("/bookings/mine");
  }

  if (!ensureAllowedBookingState(booking)) {
    req.flash("error", "This booking cannot be cancelled");
    return res.redirect("/bookings/mine");
  }

  booking.status = "cancelled";
  booking.respondedAt = new Date();
  await booking.save();

  req.flash("success", "Booking cancelled successfully");
  res.redirect("/bookings/mine");
};
