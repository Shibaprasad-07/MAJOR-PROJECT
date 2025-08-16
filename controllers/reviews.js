const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Create review
    const newReview = new Review({
        rating: req.body.review.rating,
        comment: req.body.review.comment,
        author: req.user._id
    });

    await newReview.save();

    // Add review
    listing.reviews.push(newReview._id);
    await listing.save();

    req.flash("success", "New review added!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove review
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });

    // Deletereview
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
};
