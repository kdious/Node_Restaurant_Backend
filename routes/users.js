// ========================================================================
// Filename:    users.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: Handles all routes under the /users route 
// ========================================================================

// Required modules, schemas, configuration files, etc.
var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify    = require('./verify');

// 1. /users route
//    Get user from uers list
//    Only admin users can retireve user info
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    User.find({}, function (err, users) {
        if (err) throw err;
        res.json(users);
    });
});

// 2. /users/register route
//    Add a new user to the database
router.post('/register', function(req, res) {
    User.register(
        // Create a new user based on the username
        // and password sent in the request body
        new User({ username : req.body.username }),
        req.body.password, function(err, user) {
            if (err) {
                return res.status(500).json({err: err});
            }
            if(req.body.firstname) {
                user.firstname = req.body.firstname;
            }
            if(req.body.lastname) {
                user.lastname = req.body.lastname;
            }
            
            // Save the new user
            user.save(function(err,user) {
                passport.authenticate('local')(req, res, function () {
                    return res.status(200).json({status: 'Registration Successful!'});
                });
            });
        }
    );
});

// 2. /users/login route
//    Used for users to login into the system
router.post('/login', function(req, res, next) {
    // Cjec the user's credentials and try to authenticate them
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        
        // If user doesn't exist in the system, send a HTTP 401 error
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }

        // Try to authenticate the user
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }

            // Get an json web token and send it back to the user
            var token = Verify.getToken(user);
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
            });
        });
    })(req, res, next);
});

// 3. /users/logout route
//    Used for users to logout of the system
router.get('/logout', function(req, res) {
    
    // Destroy the current session
    req.logout();
    
    // Send a simple response
    res.status(200).json({
        status: 'Bye!'
    });
});

// Objects and APIs from this module
module.exports = router;
