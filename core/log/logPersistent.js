var winston = require('winston');

//
// Requiring `winston-mongohq` will expose
// `winston.transports.MongoHQ`
//
require('../../lib/winston-mongohq').MongoHQ;

var LogPersistent = function (app) {
//    var dataURL = app.dataURL;
//
//    // add a transport for winston
//    winston.add(winston.transports.MongoHQ, {
//        mongohqURL: dataURL
//    });
    this.loggers = {};
    console.log(winston);
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

p.getLogger = function (userId, app) {
    var loggerUID = userId + '-' + app,
        logger = this.loggers[loggerUID];

    if (!logger) {
        logger = new (winston.Logger)({
            transports: [
                new winston.transports.MongoHQ({
                    mongohqURL: 'mongodb://cloud_logging_user:test123@staff.mongohq.com:10032/' + userId,
                    collection: app
                })
            ]
        });
        this.loggers[loggerUID] = logger;
    }

    console.log(logger);

    return logger;
};

exports.LogPersistent = LogPersistent;