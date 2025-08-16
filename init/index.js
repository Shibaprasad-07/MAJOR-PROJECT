require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL;

(async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);

    console.log("Data was initialized");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
})();