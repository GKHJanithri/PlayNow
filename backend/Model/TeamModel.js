const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: { 
        type: String, 
        required: [true, 'Team name is required'], 
        unique: true,
        trim: true
    },
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', // Connects to Chamindu's EventModel
        required: [true, 'An event must be selected'] 
    },
    captainId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Connects to the existing UserModel
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Team', teamSchema);