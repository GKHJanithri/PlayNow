const mongoose = require("mongoose");

const { Schema } = mongoose;

const EventSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		sportType: { type: String, trim: true },
		tournamentType: { type: String, trim: true },
		description: { type: String, trim: true },
		venue: { type: String, trim: true },
		startDate: { type: Date, required: true },
		endDate: { type: Date },
		teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
		participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
		capacity: { type: Number, default: 0 },
		status: {
			type: String,
			enum: ["scheduled", "ongoing", "completed", "cancelled", "upcoming"],
			default: "scheduled"
		},
		createdBy: { type: Schema.Types.ObjectId, ref: "User" }
	},
	{ timestamps: true }
);

EventSchema.index({ startDate: 1 });

module.exports = mongoose.models.Event || mongoose.model("Event", EventSchema);