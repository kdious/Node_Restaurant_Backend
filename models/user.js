// ========================================================================
// Filename:    user.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: MongoDB schema detailing a system user
// ========================================================================

// Required modules and types
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// Define the promotion schema
// The user schema defines a a system user
// For admin users, the admin flag is set to "true"
// Admin users have special privileges that are
// defined in the various app routers.
var User = new Schema({
    username: String,
    password: String,
    firstname: {
      type: String,
        default: ''
    },
    lastname: {
      type: String,
        default: ''
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

// Return the full name of the user as a string
User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

// Add the passport-local-mongose plugin to the user schema
// THis handles the username and password login authentication
User.plugin(passportLocalMongoose);

// Export this module to make it available to our Node applications
module.exports = mongoose.model('User', User);
