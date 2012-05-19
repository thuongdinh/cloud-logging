var winston = require('winston');

//
// Requiring `winston-mongohq` will expose
// `winston.transports.MongoHQ`
//
require('../../lib/winston-mongohq').MongoHQ;

/**
 * @constructor
 * @param app
 */
var LogPersistent = function (app) {
    this.loggers = {};
    this.app = app;
};

var p = LogPersistent.prototype;

/**
 *
 * @param opt
 *  {
 *      level
 *      message
 *      userId
 *      app
 *  }
 */
p.log = function (opt, callback) {
    opt = opt || {};

    var level = opt.level || 'info',
        message = opt.message,
        userId = opt.userId,
        app = opt.app;

    this._getLogger(userId, app).log(level, message);

    // this part only for testing
    if (callback)
        setTimeout(callback, 100);
};

/**
 *
 * @param opt
 *  {
 *
 *      userId
 *      app
 *  }
 */
p.queryLogs = function (opt, callback) {
    opt = opt || {};

    var userId = opt.userId,
        app = opt.app,
        queryOpts = this._buildQueryInRange(opt);

    this._getLoggerDb(userId, app, function (db) {
        if (db) {
            db.collection(app, function (err, col){
                col
                    .find(queryOpts)
                    .limit(opt.limit || 1000)
                    .skip(opt.start || 0)
                    .toArray(function(err, docs) {
                        callback(err, docs);
                    });
            });
        }
    });
};

p._buildQueryInRange = function (opt) {
    if (!opt)
        return {};

    var queryOpt = null;

    if (opt.startTime && opt.endTime) {
        queryOpt = {
            "timestamp": {
                $gte: opt.startTime,
                $lte: opt.endTime
            }
        }
    }

    return queryOpt;
};

/**
 * Logger factory
 *
 * @param userId
 * @param app
 */
p._getLogger = function (userId, app) {
    var loggerUID = userId + '-' + app,
        logger = this.loggers[loggerUID];

    if (!logger) {
        logger = new (winston.Logger)({
            transports: [
                new winston.transports.MongoHQ({
                    mongohqURL: this.app.dataURL + '/log_' + userId,
                    collection: app
                })
            ]
        });
        this.loggers[loggerUID] = logger;
    }

    return logger;
};

/**
 * Get db of log
 * @param userId
 * @param app
 * @param callback
 */
p._getLoggerDb = function (userId, app, callback) {
    var logger = this._getLogger(userId, app);
    logger.transports["mongohq"].open(function () {
        callback(logger.transports["mongohq"]._db);
    });
};

// Export
//-------
exports.LogPersistent = LogPersistent;