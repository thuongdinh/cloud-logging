var vows = require('vows'),
    assert = require('assert'),
    Fixtures = require('./helper/fixtures-helper'),
    LogPersistent = require('../core/log/log-persistent').LogPersistent,
    ERROR = require('../core/const/code').ERROR,
    _ = require('underscore');

fixturesHelper = new Fixtures('mongodb://root:123456@flame.mongohq.com:27089/log_test');
fixturesHelper.clean('log');

// make log persistent instance
var logPersistent = new  LogPersistent({
    dataURL: 'mongodb://root:123456@flame.mongohq.com:27089'
});

// Helper methods
// --------------
function cleanLogBeforeTest () {
    fixturesHelper.clean('log', this.callback);
}
function loadFixtures () {
    var self = this;
    fixturesHelper.loadFixtures(function () {
        setTimeout(self.callback, 200);
    });
}

// Test cases
// --------------
vows.describe('Simple add/get logs').addBatch({
   'add a log message': {
        topic: cleanLogBeforeTest,

        'after success clean data': {
            topic: function () {
                var self = this;

                // log a message
                logPersistent.log({
                    level: 'info',
                    message: 'Test log',
                    app: 'log',
                    userId: 'test'
                }, function () {
                    fixturesHelper.loadCollection('log', self.callback);
                });
            },

            'check log result': function (e, docs) {
                assert.isNull(e);
                assert.equal(_.size(docs), 1);
            }
        }
   }
}).addBatch({
    'query': {
        topic: loadFixtures,

        'all logs': {
            topic: function () {
                logPersistent.queryLogs({
                    app: 'log',
                    userId: 'test'
                }, this.callback);
            },

            'check log result': function (e, logs) {
                assert.isNull(e);
                assert.equal(_.size(logs), 6);

                // logs should order by time
                assert.equal(logs[0].message, 'Test log1'); // first test log
                assert.equal(logs[5].message, 'Test log6'); // last test log
            }
        },

        'all logs with limit': {
            topic: function () {
                logPersistent.queryLogs({
                    app: 'log',
                    userId: 'test',
                    limit: 2,
                    start: 0
                }, this.callback);
            },

            'check log result': function (e, logs) {
                assert.isNull(e);
                assert.equal(_.size(logs), 2);
            }
        },

        'logs by date': {
            topic: function () {
                logPersistent.queryLogs({
                    app: 'log',
                    userId: 'test',
                    startTime: "2012-05-16 10:00:11 UTC",
                    endTime: "2012-05-16 12:00:11 UTC"
                }, this.callback);
            },

            'check log result': function (e, logs) {
                assert.isNull(e);
                assert.equal(_.size(logs), 3);
            }
        },

        'logs by date with limit': {
            topic: function () {
                logPersistent.queryLogs({
                    app: 'log',
                    userId: 'test',
                    startTime: "2012-05-16 10:00:11 UTC",
                    endTime: "2012-05-16 12:00:11 UTC",
                    limit: 2,
                    start: 0
                }, this.callback);
            },

            'check log result': function (e, logs) {
                assert.isNull(e);
                assert.equal(_.size(logs), 2);
            }
        },

        'logs with hacking date should return error': {
            topic: function () {
                logPersistent.queryLogs({
                    app: 'log',
                    userId: 'test',
                    startTime: "2012-08-16 10:70:11 UTC",
                    endTime: "2012-05-16 12:00:11 UTC",
                    limit: 2,
                    start: 0
                }, this.callback);
            },

            'check log result': function (e, logs) {
                assert.isNotNull(e);
                assert.equal(e.code, ERROR.WRONG_DATE_FORMAT.code);
            }
        },

        'logs with startTime larger than endTime should return error': {
            topic: function () {
                logPersistent.queryLogs({
                    app: 'log',
                    userId: 'test',
                    startTime: "2012-08-16 10:58:11 UTC",
                    endTime: "2012-05-16 12:00:11 UTC",
                    limit: 2,
                    start: 0
                }, this.callback);
            },

            'check log result': function (e, logs) {
                assert.isNotNull(e);
                assert.equal(e.code, ERROR.WRONG_DATE_FORMAT.code);
            }
        }

    }
}).export(module);