const express = require('express');
const router = express.Router();
const { createFreeAgent, getAllFreeAgents, updateFreeAgentStatus } = require('../Controllers/FreeAgentController');
const { verifyToken, requireRole } = require('../Middleware/authMiddleware');

// Route to register as a free agent (POST request)
// Allowed: Students (to register themselves) and Admins
router.post('/', verifyToken, requireRole(['Student', 'Admin']), createFreeAgent);

// Route for coaches to view all free agents (GET request)
// Allowed: Coaches (to view on dashboard) and Admins
router.get('/', verifyToken, requireRole(['Coach', 'Admin']), getAllFreeAgents);

// Route for coaches to update a free agent's status (PUT request)
// Allowed: Coaches and Admins
router.put('/:id/status', verifyToken, requireRole(['Coach', 'Admin']), updateFreeAgentStatus);

module.exports = router;