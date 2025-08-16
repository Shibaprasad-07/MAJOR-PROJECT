const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

//user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

// redirect URL
const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

//user is listing's owner
const isListingAuthor = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

//current user is review's author
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// Validate Listing schema (Joi)
const validateListing = async (req, res, next) => {
    //Cloudinary URL
    if (req.file) {
        req.body.listing.image = req.file.path;
    } else {

        if (req.method === "PUT" || req.method === "PATCH") {
            const { id } = req.params;
            if (id) {
                const listing = await Listing.findById(id);
                if (listing && listing.image) {
                    if (!req.body.listing) req.body.listing = {};
                    req.body.listing.image = listing.image;
                }
            }
        }
    }

    // Allow empty image string in Joi validation for updates
    const { error } = listingSchema.validate(req.body, { allowUnknown: true });
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);
    }
    next();
};

// Validate Review schema (Joi)
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);
    }
    next();
};

// Export all middleware
module.exports = {
    isLoggedIn,
    saveRedirectUrl,
    isListingAuthor,
    isReviewAuthor,
    validateListing,
    validateReview
};