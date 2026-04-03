const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams, updateTeamStatus } = require('../Controllers/TeamController');
const { verifyToken, requireRole } = require('../Middleware/authMiddleware');

// Route to create a new team (POST request)
// Allowed: Students (to register teams) and Admins
router.post('/', verifyToken, requireRole(['Student', 'Admin']), createTeam);

// Route to get all teams for the coach (GET request)
// Allowed: Coaches (to view on dashboard) and Admins
router.get('/', verifyToken, requireRole(['Coach', 'Admin']), getAllTeams);

// Route to approve or reject a team (PUT request - used for updating)
// Allowed: Coaches and Admins
router.put('/:id/status', verifyToken, requireRole(['Coach', 'Admin']), updateTeamStatus);

module.exports = router;