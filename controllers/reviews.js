const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // If no rating is provided or rating is 0, set default to 1
    let rating = req.body.review.rating;
    if (!rating || Number(rating) < 1) {
        rating = 1;
    }

    // Create review explicitly from form data
    const newReview = new Review({
        rating,
        comment: req.body.review.comment,
        author: req.user._id
    });

    await newReview.save();

    // Add review to listing
    listing.reviews.push(newReview._id);
    await listing.save();

    req.flash("success", "New review added!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove review reference from listing
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });

    // Delete the actual review document
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
};