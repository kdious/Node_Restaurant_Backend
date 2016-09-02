// ========================================================================
// Filename:    favorites.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: MongoDB schema detailing a list of a user's favorite dishes
// ========================================================================

// Required modules and types
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the favorite schema
// The favorite schema is a list of favorite dishes of a user
// This schema stores a) info about a user, and b) a list
// dishes that the user has identified as their favorite
// dishes.  This schema stores references to User objects
// and Dish objects.
var favoriteSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dishes:[{type: mongoose.Schema.Types.ObjectId, ref: 'Dish'}]
    },
    {
        timestamps: true
    }
);

// Create a model for the favorite schema
var Favorites = mongoose.model('Favorites', favoriteSchema);

// Export this module to make it available to our Node applications
module.exports = Favorites;
