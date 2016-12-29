// app
// external modules
var util = require('util');
var async = require('async');
var LZString = require('lz-string');

// core
var config = require("./lib/config.js");
var logger = require("./lib/logger.js");

// new models
var models = require("./lib/models");

function showProgress(index, total, name) {
    // show every 100 counts
    if (index % 100 == 0) {
        logger.info('migrate ' + name + ' processing: ' + index + '/' + total);
    }
}

function isInKeyStr(str) {
    return /^[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+\/=]+$/.test(str);
}

function decompress(str) {
    var _str = null;
    try {
        if (str) {
            if (isInKeyStr(str)) {
                _str = LZString.decompressFromBase64(str);
            } else {
                _str = str;
            }
        } else {
            _str = null;
        }
    } catch (err) {
        logger.error(err);
        _str = str;
    }
    return _str;
}

function migrateNotes(callback) {
    logger.info('> migrate notes');
    models.Note.findAll().then(function (notes) {
        logger.info('found ' + notes.length + ' notes!');
        var successCount = 0;
        async.eachOfSeries(notes, function (note, key, _callback) {
            note.update({
                title: decompress(note.title),
                content: decompress(note.content),
                authorship: decompress(note.authorship)
            }).then(function (note) {
                successCount++;
                showProgress(key + 1, notes.length, 'notes');
                return _callback();
            }).catch(function (err) {
                logger.error('migrate notes failed on: ' + note.id);
                logger.error('migrate notes failed: ' + err);
                return _callback();
            });
        }, function (err) {
            models.Note.count().then(function (count) {
                logger.info('migrate notes success: ' + successCount + '/' + count);
                return callback();
            }).catch(function (err) {
                logger.error('count db notes failed: ' + err);
                return callback(err);
            });
        });
    }).catch(function (err) {
        return callback(err);
    });
}

function migrateRevisions(callback) {
    logger.info('> migrate revisions');
    models.Revision.findAll().then(function (revisions) {
        logger.info('found ' + revisions.length + ' revisions!');
        var successCount = 0;
        async.eachOfSeries(revisions, function (revision, key, _callback) {
            revision.update({
                patch: decompress(revision.patch),
                lastContent: decompress(revision.lastContent),
                content: decompress(revision.content),
                authorship: decompress(revision.authorship)
            }).then(function (revision) {
                successCount++;
                showProgress(key + 1, revisions.length, 'revisions');
                return _callback();
            }).catch(function (err) {
                logger.error('migrate revisions failed on: ' + revision.id);
                logger.error('migrate revisions failed: ' + err);
                return _callback();
            });
        }, function (err) {
            models.Revision.count().then(function (count) {
                logger.info('migrate revisions success: ' + successCount + '/' + count);
                return callback();
            }).catch(function (err) {
                logger.error('count db revisions failed: ' + err);
                return callback(err);
            });
        });
    }).catch(function (err) {
        return callback(err);
    });
}

// sync new db models
models.sequelize.sync().then(function () {
    logger.info('connect to db and sync success!');
    logger.info('---start migration---');
    async.series({
        migrateNotes: migrateNotes,
        migrateRevisions: migrateRevisions
    }, function(err, results) {
        if (err) {
            throw err;
        } else {
            logger.info('---migration complete---');
            process.exit(0);
        }
    });
}).catch(function (err) {
    logger.error('migration failed: ' + util.inspect(err));
    process.exit(1);
});

// log uncaught exception
process.on('uncaughtException', function (err) {
    logger.error('An uncaught exception has occured.');
    logger.error(err);
    logger.error('Process will exit now.');
    process.exit(1);
});