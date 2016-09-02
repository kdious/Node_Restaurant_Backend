// ========================================================================
// Filename:    verify.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: Handles verification, login and logout functionality 
// ========================================================================

// Required modules, schemas, configuration files, etc.
var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');

// Generate and return a JSON web token
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

// Verify whether a user is a regular user
exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

// Verify whether the user is an admin user
exports.verifyAdmin = function (req, res, next) {
    // Check the header to see if the user is an admin user or not
    var isAdmin = req.decoded._doc.admin;

    // decode token
    if (isAdmin == true) {
        next();
    } else {
        // if there is no token
        // return an error
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};
