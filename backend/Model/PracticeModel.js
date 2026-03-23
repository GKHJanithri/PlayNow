const mongoose = require("mongoose");

const { Schema } = mongoose;

const PracticeSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    practiceDateTime: { type: Date, required: true },
    location: { type: String },
    notes: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Practice || mongoose.model("Practice", PracticeSchema);
