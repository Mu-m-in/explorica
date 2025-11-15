const express = require("express");
const router = express.Router({mergeParams:true});

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const {validatereview, isLoggedIn, isAuthor} = require("../middleware.js")
const reviewController = require("../controller/reviews.js")


// reviews route
router.post("/",isLoggedIn , validatereview ,wrapAsync(reviewController.createReview))

// delete review route 
router.delete("/:reviewId",isLoggedIn ,isAuthor , wrapAsync(reviewController.destroyReview))

module.exports = router;