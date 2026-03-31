const Facility = require("../models/facilityModel");
const Booking = require("../models/bookingModel");

// @desc    Get all facilities
// @route   GET /api/facilities
const getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single facility by id
// @route   GET /api/facilities/:id
const getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.json(facility);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add a new facility (admin only – you can add auth later)
// @route   POST /api/facilities
const addFacility = async (req, res) => {
  try {
    const { facilityName, sportType, maxPlayers, location, availability } = req.body;

    // Basic validation
    if (!facilityName || !sportType || !maxPlayers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const facility = new Facility({
      facilityName,
      sportType,
      maxPlayers,
      location: location || "University Sports Complex",
      availability: availability !== undefined ? availability : true,
    });

    const savedFacility = await facility.save();
    res.status(201).json(savedFacility);
  } catch (error) {
    // Handle duplicate facility name (MongoDB error code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Facility with this name already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update facility by id
// @route   PUT /api/facilities/:id
const updateFacility = async (req, res) => {
  try {
    const { facilityName, sportType, maxPlayers, location, availability } = req.body;

    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    if (facilityName !== undefined) facility.facilityName = facilityName;
    if (sportType !== undefined) facility.sportType = sportType;
    if (maxPlayers !== undefined) facility.maxPlayers = maxPlayers;
    if (location !== undefined) facility.location = location;
    if (availability !== undefined) facility.availability = availability;

    if (!facility.facilityName || !facility.sportType || !facility.maxPlayers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedFacility = await facility.save();
    res.json(updatedFacility);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Facility with this name already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Book a facility
// @route   POST /api/book
const bookFacility = async (req, res) => {
  try {
    const { facilityId, studentName, studentId, date, startTime, endTime, players } = req.body;

    // Validate required fields
    if (!facilityId || !studentName || !studentId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if facility exists and is available
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }
    if (!facility.availability) {
      return res.status(400).json({ message: "Facility is currently unavailable" });
    }

    // Optional: Check if players count exceeds max capacity
    if (players && facility.maxPlayers && players > facility.maxPlayers) {
      return res.status(400).json({ message: "Number of players exceeds facility capacity" });
    }

    // Prevent double booking: check if there's already a booking for same facility, date, and overlapping time
    const existingBooking = await Booking.findOne({
      facilityId,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (existingBooking) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    // Create booking
    const booking = new Booking({
      facilityId,
      studentName,
      studentId,
      date,
      startTime,
      endTime,
      players: players || 1,
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    // Handle duplicate key error from MongoDB unique index (MongoDB error code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Time slot already booked (duplicate key)" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
const getBookings = async (req, res) => {
  try {
    // Optionally populate facility details
    const bookings = await Booking.find().populate("facilityId");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a facility
// @route   DELETE /api/facilities/:id
const deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    // Remove related bookings to keep data consistent after facility removal.
    await Booking.deleteMany({ facilityId: facility._id });
    await facility.deleteOne();

    res.json({ message: "Facility deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/booking/:id
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    await booking.deleteOne();
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a booking (reschedule)
// @route   PUT /api/booking/:id
const updateBooking = async (req, res) => {
  try {
    const { date, startTime, endTime, players } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if facility is still available
    const facility = await Facility.findById(booking.facilityId);
    if (!facility || !facility.availability) {
      return res.status(400).json({ message: "Facility is currently unavailable" });
    }

    // If time details are provided, check for overlaps (excluding this booking)
    if (date && startTime && endTime) {
      // Basic validation
      if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing date or time fields" });
      }

      // Prevent double booking
      const overlapping = await Booking.findOne({
        facilityId: booking.facilityId,
        date,
        _id: { $ne: booking._id }, // exclude current booking
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
      });
      if (overlapping) {
        return res.status(400).json({ message: "Time slot already booked" });
      }

      booking.date = date;
      booking.startTime = startTime;
      booking.endTime = endTime;
    }

    // Update players count if provided
    if (players !== undefined) {
      // Optional: check against facility max capacity
      if (players > facility.maxPlayers) {
        return res.status(400).json({ message: "Number of players exceeds facility capacity" });
      }
      booking.players = players;
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    // Handle duplicate key error from MongoDB unique index
    if (error.code === 11000) {
      return res.status(400).json({ message: "Time slot already booked (duplicate key)" });
    }
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getFacilities,
  getFacilityById,
  addFacility,
  updateFacility,
  deleteFacility,
  bookFacility,
  getBookings,
  cancelBooking,
  updateBooking, 
};