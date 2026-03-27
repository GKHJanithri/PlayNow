const FreeAgent = require('../Model/FreeAgentModel');

// @desc    Register a student as a free agent
// @route   POST /api/free-agents
exports.createFreeAgent = async (req, res) => {
    try {
        const { studentId, eventId, skillLevel, experienceDescription } = req.body;
        
        // Optional: Check if the student is already registered as a free agent for this specific event
        const existingRequest = await FreeAgent.findOne({ studentId, eventId });
        if (existingRequest) {
            return res.status(400).json({ message: 'You have already registered as a free agent for this event.' });
        }

        const newFreeAgent = await FreeAgent.create({
            studentId,
            eventId,
            skillLevel,
            experienceDescription
        });

        res.status(201).json(newFreeAgent);
    } catch (error) {
        res.status(500).json({ message: 'Error registering free agent', error: error.message });
    }
};

// @desc    Get all free agents (For the Coach Dashboard)
// @route   GET /api/free-agents
exports.getAllFreeAgents = async (req, res) => {
    try {
        // Populate pulls in the actual Student and Event details
        const freeAgents = await FreeAgent.find()
            .populate('studentId', 'email') // Assuming User model has email
            .populate('eventId', 'eventName'); // Assuming Event model has eventName
            
        res.status(200).json(freeAgents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching free agents', error: error.message });
    }
};

// @desc    Update Free Agent status (Coach assigns them to a team)
// @route   PUT /api/free-agents/:id/status
exports.updateFreeAgentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Coach will send 'Assigned' or 'Rejected'

        const updatedFreeAgent = await FreeAgent.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!updatedFreeAgent) {
            return res.status(404).json({ message: 'Free agent request not found' });
        }

        res.status(200).json(updatedFreeAgent);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};