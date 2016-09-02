// ========================================================================
// Filename:    index.js
// Author:      Kevin Dious (kdious@gmail.com)
// Description: Handles all routes under the / route 
// ========================================================================

// Required modules, schemas, configuration files, etc.
var express = require('express');
var router = express.Router();

// Configure the varioues routes for the /dishes route
// 1. / route

// Render the home page
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

// Objects and APIs from this module
module.exports = router;
