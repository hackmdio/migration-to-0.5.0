"use strict";

// external modules
var Sequelize = require("sequelize");
var shortId = require('shortid');

// core
var config = require("../config.js");
var logger = require("../logger.js");

// permission types
var permissionTypes = ["freely", "editable", "locked", "private"];

module.exports = function (sequelize, DataTypes) {
    var Note = sequelize.define("Note", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        shortid: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            defaultValue: shortId.generate
        },
        alias: {
            type: DataTypes.STRING,
            unique: true
        },
        permission: {
            type: DataTypes.ENUM,
            values: permissionTypes
        },
        viewcount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        title: {
            type: DataTypes.TEXT
        },
        content: {
            type: DataTypes.TEXT
        },
        authorship: {
            type: DataTypes.TEXT
        },
        lastchangeAt: {
            type: DataTypes.DATE
        },
        savedAt: {
            type: DataTypes.DATE
        }
    });

    return Note;
};