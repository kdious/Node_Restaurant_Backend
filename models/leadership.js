// ========================================================================
// Filename:    leadership.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: MongoDB schema a company leader
// ========================================================================

// Required modules and types
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the leader schema
// The leader schema defines a company leader
var leaderSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String
        },
        designation: {
            type: String
        },
        abbr: {
            type: String,
        },
        description: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

// Create a model for the leader schema
var leaders = mongoose.model('leader', leaderSchema);

// Export this module to make it available to our Node applications
module.exports = leaders;
