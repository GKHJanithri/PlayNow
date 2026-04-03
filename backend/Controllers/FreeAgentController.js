const FreeAgent = require('../Model/FreeAgentModel');

// @desc    Register as a free agent
exports.createFreeAgent = async (req, res) => {
    try {
        const { studentId, eventId, skillLevel, experienceDescription } = req.body;
        
        const newAgent = await FreeAgent.create({
            studentId,
            eventId,
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
        const agents = await FreeAgent.find();
        res.status(200).json(agents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching free agents', error: error.message });
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