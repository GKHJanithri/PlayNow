const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  players: {
    type: Number,
    default: 1,
  },
}, { timestamps: true }); // adds createdAt & updatedAt

// Prevent double‑booking at database level
bookingSchema.index(
  { facilityId: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

module.exports = mongoose.model("Booking", bookingSchema);