const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isListingAuthor, validateListing } = require('../middleware.js');
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const Listing = require("../models/listing");

// LISTINGS INDEX & CREATE
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// NEW LISTING FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW, UPDATE, DELETE LISTING
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isListingAuthor,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isListingAuthor, wrapAsync(listingController.destroyListing));

// EDIT LISTING FORM
router.get("/:id/edit", isLoggedIn, isListingAuthor, wrapAsync(listingController.editForm));

// FILTER LISTINGS BY CATEGORY
router.get("/category/:category", wrapAsync(async (req, res) => {
    let { category } = req.params;
    const search = req.query.q;
    let filter = { category };
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
        ];
    }
    const listings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings: listings, search, category });
}));

module.exports = router;