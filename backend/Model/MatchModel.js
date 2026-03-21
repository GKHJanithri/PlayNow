const mongoose = require("mongoose");

const { Schema } = mongoose;

const MatchSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    round: { type: String },
    teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    matchDateTime: { type: Date, required: true },
    venue: { type: String },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    wicketsA: { type: Number, default: 0 },
    wicketsB: { type: Number, default: 0 },
    oversA: { type: Number, default: 0 },
    oversB: { type: Number, default: 0 },
    battingSide: { type: String, enum: ["A", "B"], default: "A" },
    striker: { type: String, trim: true },
    nonStriker: { type: String, trim: true },
    bowler: { type: String, trim: true },
    thisOver: [{ type: String }],
    winner: { type: Schema.Types.ObjectId, ref: "Team" },
    status: { type: String, enum: ["scheduled", "live", "completed", "cancelled"], default: "scheduled" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Match || mongoose.model("Match", MatchSchema);
