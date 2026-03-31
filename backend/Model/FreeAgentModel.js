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
        required: [true, 'Please select a preferred event or sport'] 
    },
    skillLevel: { 
        type: String, 
        enum: ['Beginner', 'Intermediate', 'Advanced'], 
        required: [true, 'Skill level is required'] 
    },
    experienceDescription: { 
        type: String,
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Assigned', 'Rejected'], 
        default: 'Pending' // Coach will change this to 'Assigned' when adding them to a team
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('FreeAgent', freeAgentSchema);