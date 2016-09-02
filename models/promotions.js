// ========================================================================
// Filename:    favorites.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: MongoDB schema detailing a company promotion
// ========================================================================

// Required modules and types
var mongoose = require('mongoose');
var mongooseCurrency = require('mongoose-currency').loadType(mongoose);
var Schema = mongoose.Schema;
var CurrencyType = mongoose.Types.Currency;

// Define the promotion schema
// The promotion schema defines a price promotion for a dish
var promotionSchema = new Schema(
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
    },
    {
        timestamps: true
    }
);

// Create a model for the promotion schema
var promotions = mongoose.model('Promotion', promotionSchema);

// Export this module to make it available to our Node applications
module.exports = promotions;
