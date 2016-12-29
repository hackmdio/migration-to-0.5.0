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
        logger.error(str);
        logger.error(err);
        _str = str;
    }
    return _str;
}

var paging = 10000;

function migrateByModel(modelName, process, callback) {
    var count = 0;
    models[modelName].count().then(function (_count) {
        logger.info('found ' + _count + ' ' + modelName.toLowerCase() + '!');
        if (_count <= 0) return callback();
        count = _count;
        var processedCount = 0;
        var successCount = 0;
        function migrateInner(baseIid) {
            models[modelName].findAll({
                order: [['iid', 'ASC']],
                limit: paging,
                where: {
                    iid: {
                        $gte: baseIid + processedCount
                    }
                }
            }).then(function (items) {
                async.eachOfSeries(items, function (item, key, _callback) {
                    var currentCount = processedCount + key + 1;
                    process(item, currentCount, function (err, result) {
                        if (err) {
                            logger.error('migrate ' + modelName.toLowerCase() + ' failed on: ' + item.id);
                            logger.error('migrate ' + modelName.toLowerCase() + ' failed: ' + err);
                            return _callback();
                        } else {
                            successCount++;
                            showProgress(currentCount, count, modelName.toLowerCase());
                            return _callback();
                        }
                    });
                }, function (err) {
                    processedCount += items.length;
                    if (processedCount >= count) {
                        logger.info('migrate ' + modelName.toLowerCase() + ' success: ' + successCount + '/' + count);
                        return callback();
                    } else {
                        return migrateInner(baseIid);
                    }
                });
            }).catch(function (err) {
                return callback(err);
            });
        }
        models[modelName].findOne({
            order: [['iid', 'ASC']]
        }).then(function (item) {
            logger.info(modelName.toLowerCase() + ' base iid is ' + item.iid);
            return migrateInner(item.iid);
        }).catch(function (err) {
            return callback(err);
        });
    }).catch(function (err) {
        logger.error('count db ' + modelName.toLowerCase() + ' failed: ' + err);
        return callback(err);
    });
}

function migrateNotesIndex(callback) {
    logger.info('> migrate notes index');
    logger.info('add column "iid" to notes!');
    var queryInterface = models.sequelize.getQueryInterface();
    queryInterface.addColumn("Notes", "iid", {
        type: models.Sequelize.INTEGER,
        autoIncrement: true
    });
    return callback();
}

function migrateNotes(callback) {
    logger.info('> migrate notes');
    migrateByModel("Note", function (note, key, _callback) {
        note.update({
            title: decompress(note.title),
            content: decompress(note.content),
            authorship: decompress(note.authorship)
        }).then(function (note) {
            return _callback(null, note);
        }).catch(function (err) {
            return _callback(err, null);
        });
    }, callback);
}

function migrateRevisionsIndex(callback) {
    logger.info('> migrate revisions index');
    logger.info('add column "iid" to revisions!');
    var queryInterface = models.sequelize.getQueryInterface();
    queryInterface.addColumn("Revisions", "iid", {
        type: models.Sequelize.INTEGER,
        autoIncrement: true
    });
    return callback();
}

function migrateRevisions(callback) {
    logger.info('> migrate revisions');
    migrateByModel("Revision", function (revision, key, _callback) {
        revision.update({
            patch: decompress(revision.patch),
            lastContent: decompress(revision.lastContent),
            content: decompress(revision.content),
            authorship: decompress(revision.authorship)
        }).then(function (revision) {
            return _callback(null, revision);
        }).catch(function (err) {
            return _callback(err, null);
        });
    }, callback);
}

// sync new db models
models.sequelize.sync().then(function () {
    logger.info('connect to db and sync success!');
    logger.info('---start migration---');
    async.series({
        migrateNotesIndex: migrateNotesIndex,
        migrateNotes: migrateNotes,
        migrateRevisionsIndex: migrateRevisionsIndex,
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