const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.alternatives().try(
            Joi.string().allow("", null),
            Joi.object({
                url: Joi.string().required(),
                filename: Joi.string().required()
            })
        ),
        price: Joi.number().min(0).required(),
        location: Joi.string().required(),
        country: Joi.string().required()
    }).required()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(0).max(5).optional(),
        comment: Joi.string().trim().required()
    }).required()
});