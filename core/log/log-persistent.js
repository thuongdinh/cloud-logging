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
p.log = function (opt) {
    opt = opt || {};

    var level = opt.level || 'info',
        message = opt.message,
        userId = opt.userId,
        app = opt.app;

    this.getLogger(userId, app).log(level, message);
};

/**
 * Logger factory
 *
 * @param userId
 * @param app
 */
p.getLogger = function (userId, app) {
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

// Export
//-------
exports.LogPersistent = LogPersistent;