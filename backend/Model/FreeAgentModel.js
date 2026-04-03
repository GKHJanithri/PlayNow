const mongoose = require('mongoose');

const freeAgentSchema = new mongoose.Schema({
    // CHANGE: From ObjectId to String to support "IT21..."
    studentId: { 
        type: String, 
        required: true 
    },
    // CHANGE: From ObjectId to String to support the hardcoded ID
    eventId: { 
        type: String, 
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