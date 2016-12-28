// external modules
var path = require('path');

// configs
var env = process.env.NODE_ENV || 'development';
var config = require(path.join(__dirname, '..', 'config.json'))[env];
var debug = process.env.DEBUG ? (process.env.DEBUG === 'true') : ((typeof config.debug === 'boolean') ? config.debug : (env === 'development'));

// db
var dburl = config.dburl || process.env.HMD_DB_URL || process.env.DATABASE_URL;
var db = config.db || {};

module.exports = {
    debug: debug,
    dburl: dburl,
    db: db
};
