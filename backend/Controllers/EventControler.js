const Event = require("../Model/EventModel");
const mongoose = require("mongoose");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, venue, startDate, endDate, capacity, createdBy } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ message: "`title` and `startDate` are required" });
    }

    const event = new Event({ title, description, venue, startDate, endDate, capacity, createdBy });
    const saved = await event.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create event" });
  }
};

// Get list of events (supports upcoming only filter)
exports.getEvents = async (req, res) => {
  try {
    const { upcoming } = req.query;
    const now = new Date();

    let filter = {};
    if (upcoming === "true") {
      filter.startDate = { $gte: now };
    }

    const events = await Event.find(filter).sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch events" });
  }
};

// Get single event by id
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid event id" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch event" });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid event id" });

    const updates = req.body;
    const event = await Event.findByIdAndUpdate(id, updates, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update event" });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid event id" });

    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete event" });
  }
};

// Join event (add participant). Body: { userId }
exports.joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!mongoose.isValidObjectId(id) || !userId) return res.status(400).json({ message: "Invalid input" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // capacity check (if capacity > 0)
    if (event.capacity > 0 && event.participants.length >= event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "User already joined" });
    }

    event.participants.push(userId);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to join event" });
  }
};

// Leave event (remove participant). Body: { userId }
exports.leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!mongoose.isValidObjectId(id) || !userId) return res.status(400).json({ message: "Invalid input" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.participants = event.participants.filter(p => p.toString() !== userId.toString());
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to leave event" });
  }
};
