const express = require("express");
const router = express.Router();
const listings = require("../controllers/listings");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudConfig"); // cloudinary storage
const upload = multer({ storage }); // Multer config

// All listings
router.get("/", catchAsync(listings.index));

// New listing form
router.get("/new", isLoggedIn, listings.renderNewForm);

// Create new listing
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  catchAsync(listings.createListing)
);

// Show listing
router.get("/:id", catchAsync(listings.showListing));

// Edit form
router.get("/:id/edit", isLoggedIn, isOwner, catchAsync(listings.renderEditForm));

// Update listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  catchAsync(listings.updateListing)
);

// Delete listing
router.delete("/:id", isLoggedIn, isOwner, catchAsync(listings.deleteListing));

module.exports = router;