"use strict";

// external modules
var Sequelize = require("sequelize");

// core
var config = require("../config.js");
var logger = require("../logger.js");

module.exports = function (sequelize, DataTypes) {
    var Revision = sequelize.define("Revision", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        patch: {
            type: DataTypes.TEXT
        },
        lastContent: {
            type: DataTypes.TEXT
        },
        content: {
            type: DataTypes.TEXT
        },
        length: {
            type: DataTypes.INTEGER
        },
        authorship: {
            type: DataTypes.TEXT
        }
    });

    return Revision;
};