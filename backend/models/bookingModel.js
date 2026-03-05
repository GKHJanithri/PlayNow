const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility"
  },
  studentName: String,
  studentId: String,
  date: String,
  startTime: String,
  endTime: String,
  players: Number
});

module.exports = mongoose.model("Booking", bookingSchema);