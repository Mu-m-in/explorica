const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema } = require("../schema.js");
const { isLoggedIn , isOwner , validateListing} = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const {storage } = require("../cloudConfig.js");
const upload = multer({ storage})

//router.route

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]') , validateListing,wrapAsync( listingController.createListing));

//search
router.get("/search",wrapAsync(listingController.search) );

//new route
router.get("/new", isLoggedIn,listingController.renderNewForm);


router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]') ,  validateListing,wrapAsync(listingController.updateListing));


//edit route
router.get("/edit/:id",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

//delete 
router.delete("/delete/:id",isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));


module.exports = router;