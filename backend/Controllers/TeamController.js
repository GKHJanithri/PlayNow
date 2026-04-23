const mongoose = require('mongoose');
const Team = require('../Model/TeamModel');
const FreeAgent = require('../Model/FreeAgentModel');
const User = require('../Model/UserModel');
const Event = require('../Model/EventModel');

// @desc    Create a new team (For Students/Captains)
// @route   POST /api/teams
exports.createTeam = async (req, res) => {
    try {
        const { teamName, eventId, captainId, teammates } = req.body;
        
        const existingTeam = await Team.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({ message: 'Team name already exists. Please choose another.' });
        }

        let captain;
        if (mongoose.Types.ObjectId.isValid(captainId)) {
            captain = await User.findById(captainId);
        }
        if (!captain) {
            captain = await User.findOne({ studentId: captainId });
        }
        if (!captain) {
            return res.status(400).json({ message: 'Captain not found. Please check the ID provided.' });
        }

        // Lookup event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(400).json({ message: 'Event not found.' });
        }

        let memberIds = [];
        
        if (teammates && teammates.length > 0) {
            const objectIds = teammates.filter((value) => mongoose.Types.ObjectId.isValid(value));
            const studentIds = teammates.filter((value) => !mongoose.Types.ObjectId.isValid(value));

            const foundUsers = await User.find({
                $or: [
                    { _id: { $in: objectIds } },
                    { studentId: { $in: studentIds } }
                ]
            });

            memberIds = foundUsers.map(user => user._id);
            if (memberIds.length !== teammates.length) {
                return res.status(400).json({ message: 'Some teammates were not found. Please verify their IDs.' });
            }
        }

        const newTeam = await Team.create({
            teamName,
            eventId: event._id,
            captainId: captain._id,
            members: memberIds
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
        const teams = await Team.find()
            .populate('captainId', 'fullName email') 
            .populate('eventId', 'title')
            .populate('members', 'fullName email'); // Populating teammates!
            
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

// @desc    Update team details (For Coaches)
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

// @desc    Delete a team (For Coaches)
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

// @desc    Assign a Free Agent to a Team
// @route   POST /api/teams/:id/assign
exports.assignAgentToTeam = async (req, res) => {
    try {
        const teamId = req.params.id;
        const { studentId, agentId } = req.body;

        if (!studentId || !agentId) {
            return res.status(400).json({ message: 'Missing student or agent ID' });
        }

        let user;
        if (mongoose.Types.ObjectId.isValid(studentId)) {
            user = await User.findById(studentId);
        }
        if (!user) {
            user = await User.findOne({ studentId });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $addToSet: { members: user._id } },
            { new: true }
        ).populate('members', 'fullName email studentId');

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        await FreeAgent.findByIdAndUpdate(agentId, { status: 'Assigned' });

        res.status(200).json({ message: 'Successfully assigned to team', team: updatedTeam });
    } catch (error) {
        console.error("Assign Error:", error);
        res.status(500).json({ message: 'Error assigning agent', error: error.message });
    }
};

// @desc    Remove a member from a team
// @route   PUT /api/teams/:id/remove-member
exports.removeMemberFromTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { memberId } = req.body;

        if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: 'Invalid member ID' });
        }

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (!team.members.some((member) => member.equals(memberId))) {
            return res.status(400).json({ message: 'User is not a member of this team' });
        }

        team.members.pull(memberId);
        await team.save();

        await FreeAgent.findOneAndUpdate({ studentId: memberId }, { status: 'Available' });

        const updatedTeam = await Team.findById(id)
            .populate('captainId', 'fullName email')
            .populate('eventId', 'title')
            .populate('members', 'fullName email studentId');

        res.status(200).json({ message: 'Member removed from team', team: updatedTeam });
    } catch (error) {
        res.status(500).json({ message: 'Error removing member', error: error.message });
    }
};