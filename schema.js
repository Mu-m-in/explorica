const joi = require("joi");

const listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        price: joi.number().required().min(0),
        rentalType: joi.string().valid("short-term", "long-term").default("short-term"),
        pricingUnit: joi.string().valid("night", "month").default("night"),
        bedrooms: joi.number().integer().greater(0).optional().empty(""),
        bathrooms: joi.number().integer().greater(0).optional().empty(""),
        squareFeet: joi.number().integer().greater(0).optional().empty(""),
        location: joi.string().required(),
        country: joi.string().required(),
        image: joi.object({
            url: joi.string().optional(),
            filename: joi.string().optional(),
        }),
    }).required(),
});

const reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required(),
});

const bookingSchema = joi.object({
    booking: joi.object({
        listingId: joi.string().required(),
        rentalType: joi.string().valid("short-term", "long-term").required(),
        startDate: joi.date().iso().required(),
        endDate: joi.date().iso().greater(joi.ref("startDate")).required(),
        guestCount: joi.number().integer().min(1).when("rentalType", {
            is: "short-term",
            then: joi.required(),
            otherwise: joi.optional(),
        }),
    }).required(),
});

module.exports.listingSchema = listingSchema;
module.exports.reviewSchema = reviewSchema;
module.exports.bookingSchema = bookingSchema;