const Team = require('../Model/TeamModel');

// @desc    Create a new team (For Students/Captains)
// @route   POST /api/teams
exports.createTeam = async (req, res) => {
    try {
        const { teamName, eventId, captainId } = req.body;
        
        // Validation: Check if team name already exists to prevent duplicates
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
        // .populate() pulls in the actual Event and User details instead of just showing random ID numbers
        const teams = await Team.find()
            .populate('eventId', 'eventName') // Assuming Chamindu's event model has an 'eventName' field
            .populate('captainId', 'email');  // Assuming the User model has an 'email' field
            
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
};

// @desc    Approve or Reject a team (For Coaches)
// @route   PUT /api/teams/:id/status
exports.updateTeamStatus = async (req, res) => {
    try {
        const { id } = req.params; // Gets the team ID from the URL
        const { status } = req.body; // Gets the new status ('Approved' or 'Rejected') from the frontend

        const updatedTeam = await Team.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true, runValidators: true } // Returns the updated team and checks the schema rules
        );

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error updating team status', error: error.message });
    }
};