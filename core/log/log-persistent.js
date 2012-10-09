var winston = require('winston'),
    check = require('validator').check,
    ERROR = require('../const/code').ERROR;

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
    this.logger = app.logger;
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

    this.logger.debug("Log message, level: ", level, ", message:", message);
    this._getLogger(userId, app).log(level, message);

    // this part only for testing
    if (callback)
        setTimeout(callback, 200);
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
        queryOpts = this._buildQuery(opt);

    this.logger.debug("Query message, data: " + JSON.stringify(opt));

    // there are some thing wrong in date format
    // should return empty dat
    if (queryOpts && queryOpts.code) {
        callback(queryOpts);
    } else {
        this._getLoggerDb(userId, app, function (db) {
            if (db) {
                db.collection(app, function (err, col){
                    col
                        .find(queryOpts)
                        .sort({timestamp: 1})
                        .limit(opt.limit || 1000)
                        .skip(opt.start || 0)
                        .toArray(function(err, docs) {
                            callback(err, docs);
                        });
                });
            }
        });
    }
};

// Querys helper
// -------------------------------
p._buildQuery = function (opt) {
    var queryOpts = this._buildQueryInRange(opt); // build range query

    // build fillter by level
    queryOpts = this._buildQueryLevel(opt, queryOpts);

    return queryOpts;
};

p._buildQueryLevel = function (opt, queryOpt) {
    if (!opt)
        return queryOpt;

    var queryOpt = queryOpt || null;

    if (opt.level && (opt.level === 'info' || opt.level === 'error' || opt.level === 'warning')) {
        queryOpt = queryOpt || {};
        queryOpt.level = opt.level;
    }

    return queryOpt;
}

p._buildQueryInRange = function (opt, queryOpt) {
    if (!opt)
        return null;

    var queryOpt = queryOpt || null;

    if (opt.startTime && opt.endTime) {
        // validate start and end time
        try {
            check(opt.startTime).isDate() && // is a date
            check(opt.endTime).isDate() && // is a date
            check(opt.startTime).isBefore(opt.endTime); // start date should before end date

            queryOpt = {
                "timestamp": {
                    $gte: opt.startTime,
                    $lte: opt.endTime
                }
            }
        } catch (e) {
            return ERROR.WRONG_DATE_FORMAT; // make sure result empty
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