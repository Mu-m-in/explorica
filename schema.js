const joi = require("joi");

const listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        price: joi.number().required().min(0),
        bedrooms: joi.number().integer().greater(0).optional().empty(""),
        bathrooms: joi.number().integer().greater(0).optional().empty(""),
        squareFeet: joi.number().integer().greater(0).optional().empty(""),
        location: joi.string().required(),
        country: joi.string().required(),
        image: joi.object({
            url: joi.string().optional(),
            filename : joi.string().optional()
        })
    }).required()
});
const reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required()
    }).required()
})

module.exports.listingSchema = listingSchema;
module.exports.reviewSchema = reviewSchema;