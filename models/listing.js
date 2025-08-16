const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [3, "Title must be at least 3 characters long"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"]
  },
  image: {
    url: String,
    filename: String
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [1, "Price must be at least 1"]
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
    minlength: [3, "Location must be at least 3 characters long"]
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true,
    minlength: [3, "Country must be at least 3 characters long"]
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
  type: String,
  enum: [
    "Trending",
    "Rooms",
    "Iconic Cities",
    "Mountains",
    "Castles",
    "Amazing Pools",
    "Camping",
    "Farms",
    "Arctic"
  ],
  required:true
}
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: {
        $in: listing.reviews
      }
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
