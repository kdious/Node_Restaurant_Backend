// ========================================================================
// Filename:    leaderRouter.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: Handles all routes under the /leaders route 
// ========================================================================

// Required modules, schemas, configuration files, etc.
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Leaders = require('../models/leadership');
var Verify = require('./verify');

// Instantiate the router
var appRouter = express.Router();

// Configure the router to use JSON body parser
appRouter.use(bodyParser.json());

// Configure the various routes for the /leaders route

// 1. /leaders route
//    Get/Add/Remove leaders from the company leaders list
appRouter.route('/')
    // You MUST be a system user in order to 
    // even view the list of leaders    
    .all(Verify.verifyOrdinaryUser)

    // Retrieve the list of company leaders
    .get(function (req, res, next) {
        Leaders.find({}, function (err, leaders) {
            if (err) {
                throw err;
            }
            res.json(leaders);
        });
    })

    // Add a leader to the leaders list in the database
    // Only admin users can add leaders
    .post(Verify.verifyAdmin, function (req, res, next) {
        Leaders.create(req.body, function (err, leader) {
            if (err) {
                throw err;
            }
            console.log('Leader created!');
            var id = leader._id;

            res.writeHead(
                200,
                {'Content-Type': 'text/plain'}
            );
            res.end('Added the leader with id: ' + id);
        });
    })

    // Remove a leader to the leaders list in the database
    // Only admin users can remove leaders
    .delete(Verify.verifyAdmin, function (req, res, next) {
        Leaders.remove({}, function (err, resp) {
            if (err) {
                throw err;
            }
            res.json(resp);
        });
    });

// 1. /leaders/:id route
//    Get/Update/Add/Remove the specified leader from the company leaders list    
appRouter.route('/:id')
    // You MUST be a system user in order to 
    // even view the list of leaders    
    .all(Verify.verifyOrdinaryUser)
    
    // Retrieve the specified leader info and send back in a response
    .get(function (req, res, next) {
        Dishes.findById(
            req.params.dishId, function (err, dish) {
            if (err) {
                throw err;
            }
            res.json(dish);
        });
    })

    // Update a leader to the leaders list in the database
    // Only admin users can add leaders
    .put(Verify.verifyAdmin, function (req, res, next) {
        Dishes.findByIdAndUpdate(
            req.params.leaderId,
            {$set: req.body},
            {new: true},
            function (err, leader) {
                if (err) {
                    throw err;
                }
                res.json(leader);
            }
        );
    })

    // Delete a leader to the leaders list in the database
    // Only admin users can delete leaders
    .delete(Verify.verifyAdmin, function (req, res, next) {
        Dishes.findByIdAndRemove(req.params.leaderId,
            function (err, resp) {
                if (err) {
                    throw err;
                }
                res.json(resp);
            }
        );
    });

// Objects and APIs from this module
module.exports = appRouter
