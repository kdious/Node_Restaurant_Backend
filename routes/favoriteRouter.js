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

        // See if there is a favorites list for this user
        favoriteDish = req.body;        
        Dishes.findById(favoriteDish._id, function (err, favoriteDish) {
            if (err) throw err;
            if(favoriteDish) {
                Favorites.findOne({'user': userId}, function (err, favoritesList) {
                    if (err) throw err;
                    if(favoritesList) {
                        favoriteDishFound = false;                         
                        for (var i = 0; i < favoritesList.dishes.length; i++) {                                                    
                            if (favoritesList.dishes[i].toString() == favoriteDish._id) {
                                favoriteDishFound = true;
                                break;
                            }
                        }
                        if (favoriteDishFound == false) {                      
                            favoritesList.dishes.push(favoriteDish._id);
                            favoritesList.save(function (err, result) {
                                if (err) throw err;
                                res.json(result);
                            });
                        }
                        else {
                            res.status(400).send('Dish ' + favoriteDish._id + ' is already in the favorites list');    
                        }
                    }
                    else {
                        // Create Favorites list
                        Favorites.create({}, function (err, newFavoritesList) {
                            if (err) {
                                throw err;
                            }
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
                return next(err);
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
//    Handle getting/removing the specified dish from the user's list of favorites
appRouter.route('/:dishObjectId')

    // Remove the specified dish from the user's favorites list
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        userId = req.decoded._doc._id;
        dishIdToRemove = req.params.dishObjectId;
        Favorites.findOne({'user': userId}, function (err, favoritesList) {
            if (err) throw err;
            if(favoritesList) {
                dishRemoved = false;                         
                for (var i = 0; i < favoritesList.dishes.length; i++) {                                                    
                    if (favoritesList.dishes[i].toString() == dishIdToRemove) {
                        favoritesList.dishes.splice(i, 1);                        
                        dishRemoved = true;
                        break;
                    }
                }
                if (dishRemoved == true) {                      
                    favoritesList.save(function (err, result) {
                        if (err) throw err;
                        res.json(result);
                    });
                }
                else {
                    res.status(400).send('Dish ' + dishIdToRemove + ' was not in the favorites list');    
                }
            }
            else {
                res.status(400).send('There are no dishes in the favorites list');    
            }
        });
    });

// Objects and APIs from this module
module.exports = appRouter
