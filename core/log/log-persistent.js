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
    console.log(app.dataURL + '/log_' + userId);
    if (!logger) {
        logger = new (winston.Logger)({
            transports: [
                new winston.transports.MongoHQ({
                    mongohqURL: app.dataURL + '/log_' + userId,
                    collection: app
                })
            ]
        });
        this.loggers[loggerUID] = logger;
    }

    console.log(logger);

    return logger;
};

// Export
//-------
exports.LogPersistent = LogPersistent;