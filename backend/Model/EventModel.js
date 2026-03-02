(function(){
const mongoose = require("mongoose");

const { Schema } = mongoose;

const EventSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		venue: { type: String, trim: true },
		startDate: { type: Date, required: true },
		endDate: { type: Date },
		capacity: { type: Number, default: 0 },
		participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

EventSchema.index({ startDate: 1 });

module.exports = mongoose.models.Event || mongoose.model("Event", EventSchema);
})();

