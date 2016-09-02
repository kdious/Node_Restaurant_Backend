// ========================================================================
// Filename:    dishRouter.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: Handles all routes under the /dishes route 
// ========================================================================

// Required modules, schemas, configuration files, etc.
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Dishes = require('../models/dishes');
var Verify = require('./verify');

// Instantiate the router
var appRouter = express.Router();

// Configure the router to use JSON body parser
appRouter.use(bodyParser.json());

// Configure the varioues routes for the /dishes route
// 1. /dishes route
appRouter.route('/')    
    // Get the dish info for dishes and send it back  
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        Dishes.find({})
            .populate('comments.postedBy') // Use mongoose population to populate the "postedBy" field with the user info
            .exec(function (err, dish) {
                if (err) throw err;
                res.json(dish);
            });
    })
    
    // Only admin users can post new dishes to the database
    // So we must make sure the user is both an ordinary user and an Admin user
    .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        // Create the new dish and send the response back        
        Dishes.create(req.body, function (err, dish) {
            if (err) {
                throw err;
            }
            console.log('Dish created!');
            var id = dish._id;

            res.writeHead(
                200,
                {'Content-Type': 'text/plain'}
            );
            res.end('Added the dish with id: ' + id);
        });
    })

    // Only admin users can delete dishes from the database
    // So we must make sure the user is both an ordinary user and an Admin user
    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        // Delete all dishes from the datavase and send an empty response back         
        Dishes.remove({}, function (err, resp) {
            if (err) {
                throw err;
            }
            res.json(resp);
        });
    });

// 2. /dishes/:dishId where dishId is the ID of a specific dish
appRouter.route('/:dishId')
    // Get the dish info for a specific dish and send it back
    .get(function (req, res, next) {
        Dishes.findById(req.params.dishId)
            .populate('comments.postedBy')  // Use mongoose population to populate the "postedBy" field with the user info
            .exec(function (err, dish) {
                if (err) throw err;
                res.json(dish);
            })
    })

    // Only admin users can add/update dishes to the database
    // So we must make sure the user is both an ordinary user and an Admin user
    .put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        // Search for the dish an dupdate it.  
        // If the dish doesn't already exist, 
        // create a new one and add it to the database        
        Dishes.findByIdAndUpdate(
            req.params.dishId,
            {$set: req.body},
            {new: true},
            function (err, dish) {
                if (err) {
                    throw err;
                }
                res.json(dish);
            }
        );
    })

    // Only admin users can remove dishes from the database
    // So we must make sure the user is both an ordinary user and an Admin user
    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        Dishes.findByIdAndRemove(req.params.dishId,
            function (err, resp) {
                if (err) {
                    throw err;
                }
                res.json(resp);
            }
        );
    });

// 3. /:dishId/comments route where dishId is the ID of a specific dish
//    This route is used to get/add/update/remove 
//    comments associated with a specific dish
appRouter.route('/:dishId/comments')
    // You MUST be a system user in order to 
    // even view comments associated with a dish    
    .all(Verify.verifyOrdinaryUser)

    // Return the comments associated with the specified dish
    .get(function (req, res, next) {
        Dishes.findById(req.params.dishId)
            .populate('comments.postedBy')
            .exec(function (err, dish) {
            if (err) throw err;
            res.json(dish.comments);
        });
    })

    // Add a comment to the the specified dish
    .post(function (req, res, next) {
        Dishes.findById(req.params.dishId, function (err, dish) {
            if (err) throw err;
            req.body.postedBy = req.decoded._doc._id;
            dish.comments.push(req.body);
            dish.save(function (err, dish) {
                if (err) throw err;
                console.log('Updated Comments!');
                res.json(dish);
            });
        });
    })

    // Only admins can delete all comments associated with a dish
    // So make sure the user is an admin
    .delete(Verify.verifyAdmin, function (req, res, next) {
        // Find the specified dish        
        Dishes.findById(req.params.dishId, function (err, dish) {
            if (err) throw err;
            // Delete all comments associated with the dish            
            for (var i = (dish.comments.length - 1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            // Save the updated dish and send a response
            dish.save(function (err, result) {
                if (err) throw err;
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end('Deleted all comments!');
            });
        });
    });

// 4. /:dishId/comments/commentId route where dishId is the ID of a specific dish
//    and commentId is the ID for a specific comment associated with the dish
//    This route is used to get/add/update/remove a specific 
//    comments associated with a specific dish
appRouter.route('/:dishId/comments/:commentId')
    // You MUST be a verified user in order to 
    // even view comments associated with a dish     
    .all(Verify.verifyOrdinaryUser)

    // Retrieve the specified comment and return in as JSON in the response
    .get(function (req, res, next) {
        Dishes.findById(req.params.dishId)
            .populate('comments.postedBy')  // Use mongoose population to populate the "postedBy" field with the user info
            .exec(function (err, dish) {
            if (err) throw err;
            res.json(dish.comments.id(req.params.commentId));
        });
    })
    
    // Update the specified comment
    .put(function (req, res, next) {
        // We delete the existing commment and insert the updated
        // comment as a new comment
        Dishes.findById(req.params.dishId, function (err, dish) {
            if (err) throw err;
            dish.comments.id(req.params.commentId).remove();
            req.body.postedBy = req.decoded._doc._id;
            dish.comments.push(req.body);
            
            // Save the updated dish and return its coments
            // in the response body.            
            dish.save(function (err, dish) {
                if (err) throw err;
                console.log('Updated Comments!');
                res.json(dish);
            });
        });
    })

    // Delete the specified comment
    .delete(function (req, res, next) {
        // Find the specified dish        
        Dishes.findById(req.params.dishId, function (err, dish) {
            // Only the user who posted the comment can remove it            
            if (dish.comments.id(req.params.commentId).postedBy
               != req.decoded._doc._id) {
                var err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }

            // Remove the specified comment, update the dish
            // and return the dish contents in the response
            dish.comments.id(req.params.commentId).remove();
            dish.save(function (err, resp) {
                if (err) throw err;
                res.json(resp);
            });
        });
    });

// Objects and APIs from this module
module.exports = appRouter
