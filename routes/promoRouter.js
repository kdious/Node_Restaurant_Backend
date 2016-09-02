// ========================================================================
// Filename:    promoRouter.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: Handles all routes under the /promotions route 
// ========================================================================

// Required modules, schemas, configuration files, etc.
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Promotions = require('../models/promotions');
var Verify = require('./verify');

// Instantiate the router
var appRouter = express.Router();

// Configure the router to use JSON body parser
appRouter.use(bodyParser.json());

// Configure the various routes for the /leaders route

// 1. /promotions route
//    Get/Add/Remove promotions from the company promotions list
appRouter.route('/')
    // You MUST be a system user in order to 
    // even view the list of leaders    
    .all(Verify.verifyOrdinaryUser)
    
    // Retrieve all promotions and return them in the response
    .get(function (req, res, next) {
        Promotions.find({}, function (err, promotions) {
            if (err) {
                throw err;
            }
            res.json(promotions);
        });
    })

    // Add a new promotion to the promostions list
    .post(Verify.verifyAdmin, function (req, res, next) {
        Promotions.create(req.body, function (err, promotion) {
            if (err) {
                throw err;
            }
            console.log('Promotion created!');
            var id = promotion._id;

            res.writeHead(
                200,
                {'Content-Type': 'text/plain'}
            );
            res.end('Added the promotion with id: ' + id);
        });
    })

    // Remove all promotions from the database
    // Only admin users can remove all promotions from the database
    .delete(Verify.verifyAdmin, function (req, res, next) {
        Promotions.remove({}, function (err, resp) {
            if (err) {
                throw err;
            }
            res.json(resp);
        });
    });

// 1. /promotions/:id route
//    Get/Update/Remove the specified promotion to/from the database
appRouter.route('/:id')
    // You MUST be a system user in order to 
    // even view the list of leaders    
    .all(Verify.verifyOrdinaryUser)

    // Retrieve and return the soecified promotion
    .get(function (req, res, next) {
        Promotions.findById(
            req.params.dishId, function (err, promotion) {
            if (err) {
                throw err;
            }
            res.json(promotion);
        });
    })

    // Update the specified promotion to the database
    // Only an admin user can update a promotion
    .put(Verify.verifyAdmin, function (req, res, next) {
        Promotions.findByIdAndUpdate(
            req.params.promotionId,
            {$set: req.body},
            {new: true},
            function (err, promotion) {
                if (err) {
                    throw err;
                }
                res.json(promotion);
            }
        );
    })

    // Remove the specified promotion from the database
    // Only an admin user can delete a promotion
    .delete(Verify.verifyAdmin, function (req, res, next) {
        Promotions.findByIdAndRemove(req.params.promotionId,
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
