"use strict";

// external modules
var Sequelize = require("sequelize");

// core
var logger = require("../logger.js");

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        profileid: {
            type: DataTypes.STRING,
            unique: true
        },
        profile: {
            type: DataTypes.TEXT
        },
        history: {
            type: DataTypes.TEXT
        },
        accessToken: {
            type: DataTypes.STRING
        },
        refreshToken: {
            type: DataTypes.STRING
        },
        email: {
            type: Sequelize.TEXT, 
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.TEXT
        }
    });

    return User;
};