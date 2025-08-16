const Listing = require("../models/listing");

// Show all listings
module.exports.index = async (req, res) => {
    try {
        const search = req.query.q;
        let filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } }
            ];
        }
        const allListings = await Listing.find(filter);
        res.render("listings/index.ejs", { allListings, search });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load listings at the moment.");
        res.redirect("/");
    }
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show a specific listing
module.exports.showListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" }
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", { listing, currUser: req.user || null });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load listing details.");
        res.redirect("/listings");
    }
};

// Create new listing
module.exports.createListing = async (req, res) => {
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

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

// Render edit form
module.exports.editForm = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }

        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load edit form.");
        res.redirect("/listings");
    }
};

// Update listing (preserve old image if none uploaded, update if new file uploaded)
module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Update basic fields
        Object.assign(listing, req.body.listing);

        // If a new file is uploaded, replace image, else keep old
        if (typeof req.file !== "undefined") {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        // If no file uploaded, do not touch image field (preserve old)

        await listing.save();
        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update listing.");
        res.redirect(`/listings/${req.params.id}/edit`);
    }
};

// Delete listing
module.exports.destroyListing = async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted the listing!");
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete listing.");
        res.redirect("/listings");
    }
};