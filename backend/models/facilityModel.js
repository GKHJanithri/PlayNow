const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema({
  facilityName: {
    type: String,
    required: true
  },
  sportType: {
    type: String,
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    default: "University Sports Complex"
  },
  availability: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Facility", facilitySchema);