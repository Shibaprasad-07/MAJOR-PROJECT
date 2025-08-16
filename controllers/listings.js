const Listing = require("../models/listing");

// Show all listings
module.exports.index = async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index", { listings });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// Create new listing
module.exports.createListing = async (req, res) => {
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        //file upload
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await newListing.save();
        req.flash("success", "Successfully created a new listing!");
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to create listing. Please try again.");
        res.redirect("/listings/new");
    }
};

// Show listing
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: { path: "author" }
        });

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
};

// Update listing
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    //updated image
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Successfully updated listing!");
    res.redirect(`/listings/${listing._id}`);
};

// Delete listing
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted listing!");
    res.redirect("/listings");
};