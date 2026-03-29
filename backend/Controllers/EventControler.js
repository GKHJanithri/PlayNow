const Event = require("../Model/EventModel");
const Match = require("../Model/MatchModel");
const Team = require("../Model/TeamModel");
const mongoose = require("mongoose");

const toObjectId = (value) => {
  if (value && mongoose.isValidObjectId(value)) return new mongoose.Types.ObjectId(value);
  return null;
};

const normalizeFixtureDate = (value, fallbackDate) => {
  const parsed = value ? new Date(value) : new Date(fallbackDate);
  if (Number.isNaN(parsed.getTime())) return new Date(fallbackDate);
  return parsed;
};

const toFixtureDto = (match) => {
  const teamA = match.teamA;
  const teamB = match.teamB;
  return {
    _id: match._id,
    eventId: match.eventId,
    round: match.round,
    teamA: teamA?.teamName || teamA?.name || teamA?._id || match.teamA,
    teamB: teamB?.teamName || teamB?.name || teamB?._id || match.teamB,
    teamAId: teamA?._id || match.teamA,
    teamBId: teamB?._id || match.teamB,
    matchDateTime: match.matchDateTime,
    venue: match.venue,
    status: match.status,
  };
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      sportType,
      tournamentType,
      description,
      venue,
      startDate,
      endDate,
      teams,
      status,
      createdBy,
    } = req.body;

    if (!title || !startDate || !venue || !sportType) {
      return res
        .status(400)
        .json({ message: "`title`, `sportType`, `venue`, and `startDate` are required" });
    }

    const event = new Event({
      title,
      sportType,
      tournamentType,
      description,
      venue,
      startDate,
      endDate,
      teams,
      status,
      createdBy,
    });
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

// Get fixtures for a specific event
exports.getEventFixtures = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid event id" });

    const fixtures = await Match.find({ eventId: id })
      .populate("teamA", "teamName name")
      .populate("teamB", "teamName name")
      .sort({ matchDateTime: 1 });

    res.json({ fixtures: fixtures.map(toFixtureDto) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch fixtures" });
  }
};

// Generate round-robin fixtures for an event
exports.generateEventFixtures = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid event id" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const existing = await Match.countDocuments({ eventId: id });
    if (existing > 0) {
      return res.status(400).json({ message: "Fixtures already exist for this event." });
    }

    const rawTeamIds = Array.isArray(event.teams) ? event.teams : [];
    const teamIds = rawTeamIds
      .map((teamId) => toObjectId(teamId))
      .filter(Boolean);

    if (teamIds.length < 2) {
      return res.status(400).json({ message: "At least two teams are required to generate fixtures." });
    }

    const teams = await Team.find({ _id: { $in: teamIds } }).select("_id");
    if (teams.length < 2) {
      return res.status(400).json({ message: "Could not resolve enough valid teams for fixture generation." });
    }

    const start = new Date(event.startDate || Date.now());
    const generated = [];

    for (let i = 0; i < teams.length; i += 1) {
      for (let j = i + 1; j < teams.length; j += 1) {
        const offsetHours = generated.length * 2;
        const matchDateTime = new Date(start.getTime() + offsetHours * 60 * 60 * 1000);
        generated.push({
          eventId: event._id,
          round: `Round ${generated.length + 1}`,
          teamA: teams[i]._id,
          teamB: teams[j]._id,
          matchDateTime,
          venue: event.venue || "TBD",
          status: "scheduled",
        });
      }
    }

    const created = await Match.insertMany(generated);
    const fixtures = await Match.find({ _id: { $in: created.map((match) => match._id) } })
      .populate("teamA", "teamName name")
      .populate("teamB", "teamName name")
      .sort({ matchDateTime: 1 });

    res.status(201).json({ fixtures: fixtures.map(toFixtureDto) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to generate fixtures" });
  }
};

// Save edited fixtures for an event
exports.saveEventFixtures = async (req, res) => {
  try {
    const { id } = req.params;
    const { fixtures } = req.body;

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid event id" });
    if (!Array.isArray(fixtures)) return res.status(400).json({ message: "Fixtures payload must be an array." });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const updates = fixtures
      .filter((fixture) => fixture && (fixture._id || fixture.id))
      .map((fixture) => {
        const fixtureId = fixture._id || fixture.id;
        const nextDate = fixture.matchDateTime || fixture.schedule;
        return Match.findOneAndUpdate(
          { _id: fixtureId, eventId: id },
          {
            matchDateTime: normalizeFixtureDate(nextDate, event.startDate || Date.now()),
            venue: fixture.venue || event.venue || "TBD",
            round: fixture.round,
          },
          { new: true }
        );
      });

    const saved = (await Promise.all(updates)).filter(Boolean);
    const savedIds = saved.map((fixture) => fixture._id);
    const refreshed = savedIds.length
      ? await Match.find({ _id: { $in: savedIds } })
        .populate("teamA", "teamName name")
        .populate("teamB", "teamName name")
        .sort({ matchDateTime: 1 })
      : [];

    res.json({ fixtures: refreshed.map(toFixtureDto) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to save fixtures" });
  }
};
