const Team = require('../Model/TeamModel');

// @desc    Create a new team (For Students/Captains)
// @route   POST /api/teams
exports.createTeam = async (req, res) => {
    try {
        const { teamName, eventId, captainId } = req.body;
        
        const existingTeam = await Team.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({ message: 'Team name already exists. Please choose another.' });
        }

        const newTeam = await Team.create({
            teamName,
            eventId,
            captainId
        });

        res.status(201).json(newTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error creating team', error: error.message });
    }
};

// @desc    Get all teams (For the Coach Dashboard)
// @route   GET /api/teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find();
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
};

// @desc    Approve or Reject a team (For Coaches)
// @route   PUT /api/teams/:id/status
exports.updateTeamStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedTeam = await Team.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!updatedTeam) return res.status(404).json({ message: 'Team not found' });
        res.status(200).json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error updating team status', error: error.message });
    }
};

// @desc    Update team details (NEW: For Coaches)
// @route   PUT /api/teams/:id
exports.updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { teamName } = req.body;

        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            { teamName },
            { new: true, runValidators: true }
        );

        if (!updatedTeam) return res.status(404).json({ message: 'Team not found' });
        res.status(200).json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error updating team', error: error.message });
    }
};

// @desc    Delete a team (NEW: For Coaches)
// @route   DELETE /api/teams/:id
exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTeam = await Team.findByIdAndDelete(id);

        if (!deletedTeam) return res.status(404).json({ message: 'Team not found' });
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting team', error: error.message });
    }
};