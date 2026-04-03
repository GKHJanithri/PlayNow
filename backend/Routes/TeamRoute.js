const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams, updateTeamStatus } = require('../Controllers/TeamController');
const { verifyToken, requireRole } = require('../Middleware/authMiddleware');

// Route to create a new team (POST request)
router.post('/', verifyToken, requireRole(['Student', 'Admin']), createTeam);

// Route to get all teams for the coach (GET request)
router.get('/', verifyToken, requireRole(['Coach', 'Admin']), getAllTeams);

// Route to approve or reject a team (PUT request)
router.put('/:id/status', verifyToken, requireRole(['Coach', 'Admin']), updateTeamStatus);

module.exports = router;