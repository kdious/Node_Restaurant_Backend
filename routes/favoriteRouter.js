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
        Favorites.findOne({'user': userId})
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

        // Get the dish object from the request message body
        favoriteDish = req.body;

        // See if the dish ID sent by the user is a valid dish
        Dishes.findById(favoriteDish._id, function (err, favoriteDish) {
            if (err) throw err;
            if(favoriteDish) {
                // Find the favorites list for this user
                Favorites.findOne({'user': userId}, function (err, favoritesList) {
                    if (err) throw err;
                    if(favoritesList) {
                        // If the user has a favorites list, search the list
                        // of dishes to see if the dish submitted by the
                        // user is already present in their facorites list
                        favoriteDishFound = false;
                        for (var i = 0; i < favoritesList.dishes.length; i++) {
                            if (favoritesList.dishes[i].toString() == favoriteDish._id) {
                                favoriteDishFound = true;
                                break;
                            }
                        }
                        if (favoriteDishFound == false) {
                            // If the dish is not in the user's favorites list
                            // add it to the user's favorites list
                            favoritesList.dishes.push(favoriteDish._id);
                            favoritesList.save(function (err, result) {
                                if (err) throw err;
                                res.json(result);
                            });
                        }
                        else {
                            // Send the user an error indicating that the
                            // dish is already in their favorites list
                            res.status(400).send('Dish ' + favoriteDish._id + ' is already in the favorites list');
                        }
                    }
                    else {
                        // Create a new Favorites list for the user
                        Favorites.create({}, function (err, newFavoritesList) {
                            if (err) {
                                throw err;
                            }

                            // Add the dish to the newly
                            // created favorites list
                            newFavoritesList.user = userId;
                            newFavoritesList.dishes.push(favoriteDish._id);

                            newFavoritesList.save(function (err, result) {
                                if (err) throw err;
                                res.json(result);
                            });
                        });
                    }
                });
            }
            else {
                // Inform the user that the dishId
                // that they sent is not a valid dish
                res.status(400).send('Dish ' + favoriteDish._id + ' is not a valid dish');
            }
        });
    })

    // Delete an entire favorites list for a particular user
    .delete(function (req, res, next) {
        userId = req.decoded._doc._id;
        Favorites.remove({'user': userId}, function (err) {
            if (err) throw err;
            res.status(200).send('All favorites removed for this user');
        });
    });

// 2. /favorites/:dishObjectId route
//    Handle getting/removing the specified dish
//    from the user's list of favorites
appRouter.route('/:dishObjectId')

    // Remove the specified dish from the user's favorites list
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        // Get the user ID from the decoded jasonwebtoken
        userId = req.decoded._doc._id;

        // Get the ID of the dish to remove
        // from the URL path
        dishIdToRemove = req.params.dishObjectId;

        // CHeck to see if this user has a favorites list
        Favorites.findOne({'user': userId}, function (err, favoritesList) {
            if (err) throw err;
            if(favoritesList) {
                // If the user has a favorites list, see if
                // the specified dish exists in their favorites list
                dishRemoved = false;
                for (var i = 0; i < favoritesList.dishes.length; i++) {
                    if (favoritesList.dishes[i].toString() == dishIdToRemove) {
                        // If the dish is present in the user's favorites list,
                        // remove the dish from the favorites list
                        favoritesList.dishes.splice(i, 1);
                        dishRemoved = true;
                        break;
                    }
                }
                if (dishRemoved == true) {
                    // If the dish was removed, save
                    // the updated the favorites list
                    favoritesList.save(function (err, result) {
                        if (err) throw err;
                        res.json(result);
                    });
                }
                else {
                    // Send an error to the user indicating
                    // that the dish was not present in
                    // their favorites list
                    res.status(400).send('Dish ' + dishIdToRemove + ' was not in the favorites list');
                }
            }
            else {
                // Send an error to the user indicating 
                // that the user has no dishes in their favorites list
                res.status(400).send('There are no dishes in the favorites list');
            }
        });
    });

// Objects and APIs from this module
module.exports = appRouter
