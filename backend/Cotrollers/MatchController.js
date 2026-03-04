const Match = require("../Model/MatchModel");
const mongoose = require("mongoose");

exports.createMatch = async (req, res) => {
  try {
    const { eventId, round, teamA, teamB, matchDateTime, venue } = req.body;
    if (!eventId || !teamA || !teamB || !matchDateTime) return res.status(400).json({ message: "Missing required fields" });

    const match = new Match({ eventId, round, teamA, teamB, matchDateTime, venue });
    const saved = await match.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create match" });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId && mongoose.isValidObjectId(eventId)) filter.eventId = eventId;
    const matches = await Match.find(filter).sort({ matchDateTime: 1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch matches" });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const match = await Match.findById(id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch match" });
  }
};

exports.updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const updates = req.body;
    // If score update and winner can be derived, optionally compute winner
    if (typeof updates.scoreA === 'number' && typeof updates.scoreB === 'number') {
      if (updates.scoreA > updates.scoreB) updates.winner = updates.teamA || undefined;
      else if (updates.scoreB > updates.scoreA) updates.winner = updates.teamB || undefined;
    }
    const match = await Match.findByIdAndUpdate(id, updates, { new: true });
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update match" });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const match = await Match.findByIdAndDelete(id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json({ message: "Match deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete match" });
  }
};
