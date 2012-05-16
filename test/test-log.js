var vows = require('vows'),
    assert = require('assert'),
    Fixtures = require('./helper/fixtures-helper'),
    LogPersistent = require('../core/log/log-persistent').LogPersistent,
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
    fixturesHelper.loadFixtures(this.callback);
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
    'query logs': {
        topic: loadFixtures,

        'query all logs': {
            topic: function () {
                logPersistent.queryLogs(null, this.callback);
            },

            'check log result': function (e, logs) {
                assert.isNull(e);
                assert.equal(_.size(logs), 6);
            }
        },

        'query all with limit': {
            topic: function () {

            },

            'check log result': function (e, docs) {

            }
        },

        'query by date': {
            topic: function () {

            },

            'check log result': function (e, docs) {

            }
        },

        'query by date with limit': {
            topic: function () {

            },

            'check log result': function (e, docs) {

            }
        },

    }
}).export(module);