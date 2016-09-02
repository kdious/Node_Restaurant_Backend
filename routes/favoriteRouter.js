// ========================================================================
// Filename:    favoriteRouter.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: Handles all routes under the /favorites route 
// ========================================================================

// Required modules, schemas, configuration files, etc.
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Favorites = require('../models/favorites');
var Dishes = require('../models/dishes');
var Verify = require('./verify');

// Instantiate the router
var appRouter = express.Router();

// Configure the router to use JSON body parser
appRouter.use(bodyParser.json());

// Configure the varioues routes for the /dishes route
// 1. /favorites route
appRouter.route('/')
    // You MUST be a system user in order to 
    // even view the list of favorite dishes    
    .all(Verify.verifyOrdinaryUser)

    // Get a user's list of favorite dishes
    .get(function (req, res, next) {
        userId = req.decoded._doc._id;
        Favorites.findById(userId)
            .populate('user')       // Use mongoose population to populate the "user" field with the user info
            .populate('dishes')     // Use mongoose population to populate the info for each dish in the list with the dish info
            .exec(function (err, favoriteDishes) {
                if (err) throw err;
                res.json(favoriteDishes);
            });
    })

    // Add a dish to a user's favorites list
    .post(function (req, res, next) {
        // Grab the userId from the decoded token        
        userId = req.decoded._doc._id;

        // See if there is a favorites list for this user
        Favorites.findById(userId, function (err, favorite) {
            if (err) throw err;
            Dishes.findById(favoriteDish._id, function (err, favoriteDish) {
                if (err) throw err;
                if(favoriteDish) {
                    Favorites.findById(dishId, function (err, favoritesList) {
                        if (err) throw err;
                        if(favoritesList) {
                            favoritesList.user = userId;
                            favoritesList.dishes.push(favoriteDish);
                            res.json(favoritesList);
                        }
                        else {
                            // Create Favorites list
                            Favorites.create(req.body, function (err, newFavoritesList) {
                                if (err) {
                                    throw err;
                                }
                                newFavoritesList.user = req.decoded._doc._id;
                                newFavoritesList.dishes.push(favoriteDish);

                                newFavoritesList.save(function (err, result) {
                                    if (err) throw err;
                                    res.json(newFavoritesList);
                                });
                            });
                        }
                    });
                }
                else {
                    return next(err);
                }
            });
        });
    })

    // Delete an entire favorites list for a particular user
    .delete(function (req, res, next) {
        userId = req.decoded._doc._id;
        Favorites.findById(userId, function (err, favoritesList) {
            if (err) throw err;
            for (var i = (dish.favoritesList.length - 1); i >= 0; i--) {
                dish.favoritesList.id(dish.favoritesList[i]._id).remove();
            }
        });
    });

// 2. /favorites/:dishObjectId route
//    Handle getting/removing the specified dish from the user's list of favorites
appRouter.route('/:dishObjectId')
    // Get the dish info for a specific dish in a user's favorites list
    .get(function (req, res, next) {
        Dishes.findById(req.params.dishObjectId)
            .populate('comments.postedBy')  // Use mongoose population to populate the "postedBy" field with the user info
            .exec(function (err, dish) {
                if (err) throw err;
                res.json(dish);
            })
    })

    // Remove the specified dish from the user's favorites list
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        userId = req.decoded._doc._id;
        Favorites.findById(userId, function (err, favoritesList) {
            if (err) throw err;
            Favorites.findById(userId, function (err, favoritesList) {
                if (err) throw err;
                favoritesList.id(req.params.dishObjectId).remove();
                res.json(newFavoritesList);
            });
        });
    });

// Objects and APIs from this module
module.exports = appRouter
