const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const bookingController = require("../controller/booking.js");
const { isLoggedIn } = require("../middleware.js");

router.get("/new/:listingId", isLoggedIn, wrapAsync(bookingController.renderBookingForm));
router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));
router.get("/mine", isLoggedIn, wrapAsync(bookingController.renderMyBookings));
router.get("/manage", isLoggedIn, wrapAsync(bookingController.renderOwnerBookings));
router.post("/:id/approve", isLoggedIn, wrapAsync(bookingController.approveBooking));
router.post("/:id/reject", isLoggedIn, wrapAsync(bookingController.rejectBooking));
router.post("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
