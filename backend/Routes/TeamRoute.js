const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams, updateTeamStatus } = require('../Controllers/TeamController');

// Route to create a new team (POST request)
router.post('/', createTeam);

// Route to get all teams for the coach (GET request)
router.get('/', getAllTeams);

// Route to approve or reject a team (PUT request - used for updating)
router.put('/:id/status', updateTeamStatus);

module.exports = router;