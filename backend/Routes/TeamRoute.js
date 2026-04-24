const express = require('express');
const router = express.Router();

const { 
    createTeam, 
    getAllTeams, 
    getTeamById,
    updateTeamStatus, 
    updateTeam, 
    deleteTeam,
    assignAgentToTeam,
    removeMemberFromTeam
} = require('../Controllers/TeamController');

// Route to create a new team
router.post('/', createTeam);

// Route to get all teams for the coach
router.get('/', getAllTeams);

// Route to get a single team with populated members
router.get('/:id', getTeamById);

// Route to approve or reject a team status
router.put('/:id/status', updateTeamStatus);

// Route to update team details (Edit)
router.put('/:id', updateTeam);

// Route to permanently delete a team
router.delete('/:id', deleteTeam);

// 🛠️ NEW: Route to assign a Free Agent to a Team
router.post('/:id/assign', assignAgentToTeam);
router.put('/:id/remove-member', removeMemberFromTeam);

module.exports = router;