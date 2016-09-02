// ========================================================================
// Filename:    dishes.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: MongoDB schemas for dishes and comments
// ========================================================================

// Required modules and types
var mongoose = require('mongoose');
var mongooseCurrency = require('mongoose-currency').loadType(mongoose);
var Schema = mongoose.Schema;
var CurrencyType = mongoose.Types.Currency;

// Define the comment schema
// Comments are stored as part of dishes (see below)
var commentSchema = new Schema(
    {
        rating:  {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment:  {
            type: String,
            required: true
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Schema used to represent a dish
var dishSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String
        },
        category: {
            type: String
        },
        label: {
            type: String,
            default: ""
        },
        price: {
            type: CurrencyType,
        },
        description: {
            type: String,
            required: true
        },
        comments:[commentSchema]
    },
    {
        timestamps: true
    }
);

// Create a model for the dish schema
var Dishes = mongoose.model('Dish', dishSchema);

// Export this module to make it available to our Node applications
module.exports = Dishes;
