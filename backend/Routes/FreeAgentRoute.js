const express = require('express');
const router = express.Router();
const { createFreeAgent, getAllFreeAgents, updateFreeAgentStatus } = require('../Controllers/FreeAgentController');

// Route to register as a free agent
router.post('/', createFreeAgent);

// Route for coaches to view all free agents
router.get('/', getAllFreeAgents);

// Route for coaches to update a free agent's status
router.put('/:id/status', updateFreeAgentStatus);

module.exports = router;