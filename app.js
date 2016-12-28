// app
// external modules
var LZString = require('lz-string');

// core
var config = require("./lib/config.js");
var logger = require("./lib/logger.js");

// new models
var models = require("./lib/models");

// log uncaught exception
process.on('uncaughtException', function (err) {
    logger.error('An uncaught exception has occured.');
    logger.error(err);
    logger.error('Process will exit now.');
    process.exit(1);
});