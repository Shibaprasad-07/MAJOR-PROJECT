const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// Check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

// Save redirect URL
const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Check listing author
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

// Check review author
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

// Validate Listing
const validateListing = async (req, res, next) => {
    if (req.file) {
        // If a new file is uploaded, use its Cloudinary path
        req.body.listing.image = req.file.path;
    } else if (req.method === "PUT" || req.method === "PATCH") {
        // If updating without new image, keep old one
        const { id } = req.params;
        if (id) {
            const listing = await Listing.findById(id);
            if (listing && listing.image) {
                if (!req.body.listing) req.body.listing = {};
                req.body.listing.image = listing.image;
            }
        }
    }

    const { error } = listingSchema.validate(req.body, { allowUnknown: true });
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);
    }
    next();
};

// Validate Review
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);
    }
    next();
};

module.exports = {
    isLoggedIn,
    saveRedirectUrl,
    isListingAuthor,
    isReviewAuthor,
    validateListing,
    validateReview
};