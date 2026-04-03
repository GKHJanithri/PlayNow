const express = require('express');
const router = express.Router();
// Added updateTeam and deleteTeam to the imports
const { 
    createTeam, 
    getAllTeams, 
    updateTeamStatus, 
    updateTeam, 
    deleteTeam 
} = require('../Controllers/TeamController');

// Route to create a new team
router.post('/', createTeam);

// Route to get all teams for the coach
router.get('/', getAllTeams);

// Route to approve or reject a team status
router.put('/:id/status', updateTeamStatus);

// NEW: Route to update team details (Edit)
router.put('/:id', updateTeam);

// NEW: Route to permanently delete a team
router.delete('/:id', deleteTeam);

module.exports = router;