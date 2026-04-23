const mongoose = require('mongoose');

const freeAgentSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event',
        required: true 
    },
    skillLevel: { 
        type: String, 
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    experienceDescription: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['Available', 'Assigned'], 
        default: 'Available' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('FreeAgent', freeAgentSchema);