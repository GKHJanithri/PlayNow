const mongoose = require('mongoose');
const FreeAgent = require('../Model/FreeAgentModel');
const User = require('../Model/UserModel');
const Event = require('../Model/EventModel');

// @desc    Register as a free agent
exports.createFreeAgent = async (req, res) => {
    try {
        const { studentId, eventId, skillLevel, experienceDescription } = req.body;
        
        let user;
        if (mongoose.Types.ObjectId.isValid(studentId)) {
            user = await User.findById(studentId);
        }
        if (!user) {
            user = await User.findOne({ studentId });
        }
        if (!user) {
            return res.status(400).json({ message: 'User not found. Please check your student ID.' });
        }

        // Lookup event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(400).json({ message: 'Event not found.' });
        }
        
        const newAgent = await FreeAgent.create({
            studentId: user._id,
            eventId: event._id,
            skillLevel,
            experienceDescription
        });

        res.status(201).json(newAgent);
    } catch (error) {
        res.status(500).json({ message: 'Error registering free agent', error: error.message });
    }
};

// @desc    Get all free agents
exports.getAllFreeAgents = async (req, res) => {
    try {
        const agents = await FreeAgent.find()
            .populate('studentId', 'fullName email studentId')
            .populate('eventId', 'title');
        res.status(200).json(agents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching free agents', error: error.message });
    }
};

// @desc    Delete a free agent from the pool
exports.deleteFreeAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAgent = await FreeAgent.findByIdAndDelete(id);

        if (!deletedAgent) {
            return res.status(404).json({ message: 'Free agent not found' });
        }

        res.status(200).json({ message: 'Free agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting free agent', error: error.message });
    }
};

// FIX: Added this missing function to stop the server crash!
// @desc    Update status (Approve/Reject)
exports.updateFreeAgentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedAgent = await FreeAgent.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedAgent) {
            return res.status(404).json({ message: 'Free agent not found' });
        }

        res.status(200).json(updatedAgent);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};