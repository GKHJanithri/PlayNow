const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: { 
        type: String, 
        required: [true, 'Team name is required'], 
        unique: true,
        trim: true
    },
    // CHANGED TO STRING: Matches the "deadbeef" ID you're sending from Frontend
    eventId: { 
        type: String, 
        required: [true, 'An event must be selected'] 
    },
    // CHANGED TO STRING: Matches "IT21..." Student IDs
    captainId: { 
        type: String, 
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