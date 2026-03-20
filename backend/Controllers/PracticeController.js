const Practice = require("../Model/PracticeModel");
const mongoose = require("mongoose");

exports.createPractice = async (req, res) => {
  try {
    const { eventId, practiceDateTime, location, notes, updatedBy } = req.body;
    if (!eventId || !practiceDateTime) return res.status(400).json({ message: "Missing required fields" });

    const p = new Practice({ eventId, practiceDateTime, location, notes, updatedBy });
    const saved = await p.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create practice" });
  }
};

exports.getPractices = async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId && mongoose.isValidObjectId(eventId)) filter.eventId = eventId;
    const items = await Practice.find(filter).sort({ practiceDateTime: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch practices" });
  }
};

exports.getPracticeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const item = await Practice.findById(id);
    if (!item) return res.status(404).json({ message: "Practice not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch practice" });
  }
};

exports.updatePractice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const updates = req.body;
    const item = await Practice.findByIdAndUpdate(id, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Practice not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update practice" });
  }
};

exports.deletePractice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const item = await Practice.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: "Practice not found" });
    res.json({ message: "Practice deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete practice" });
  }
};
