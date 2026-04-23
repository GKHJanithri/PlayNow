const express = require('express');
const router = express.Router();

const { 
    createTeam, 
    getAllTeams, 
    updateTeamStatus, 
    updateTeam, 
    deleteTeam,
    assignAgentToTeam // 🛠️ NEW: Imported the assign function
} = require('../Controllers/TeamController');

// Route to create a new team
router.post('/', createTeam);

// Route to get all teams for the coach
router.get('/', getAllTeams);

// Route to approve or reject a team status
router.put('/:id/status', updateTeamStatus);

// Route to update team details (Edit)
router.put('/:id', updateTeam);

// Route to permanently delete a team
router.delete('/:id', deleteTeam);

// 🛠️ NEW: Route to assign a Free Agent to a Team
router.post('/:id/assign', assignAgentToTeam);

module.exports = router;