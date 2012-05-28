var vows = require('vows'),
    assert = require('assert'),
    Fixtures = require('./helper/fixtures-helper'),
    Auth = require('../core/auth/db-auth').Auth,
    ERROR = require('../core/const/code').ERROR,
    _ = require('underscore');


var fixturesHelper = new Fixtures('mongodb://root:123456@flame.mongohq.com:27090/admin_user');

// make auth persistent instance
var authService = new Auth({
    authInfo: {
        dataURL: 'mongodb://root:123456@flame.mongohq.com:27090/admin_user',
        userCollection: 'user_test', // user information
        appCollection: 'app_test' // user's app information
    }
});

// Helper methods
// --------------
function cleanAuthBeforeTest () {
    fixturesHelper.clean('user_test', this.callback);
}
function loadFixtures () {
    var self = this;
    fixturesHelper.loadFixtures(function () {
        setTimeout(self.callback, 200);
    });
}

// Test cases
// --------------
vows.describe('Simple add/get user information').addBatch({
    'add a user': {
        topic: cleanAuthBeforeTest,

        'after success clean data': {
            topic: function () {
                var self = this;

                // log a message
                authService.createUser({
                    email: 'alice@domain.com',
                    password: 'pass123',
                    metadata: {
                        name: 'alice',
                        age: '18'
                    }
                }, function (resp) {
                    assert.equal(resp.data.code, 0);
                    assert.isNotNull(resp.data.userId);

                    fixturesHelper.loadCollection('user_test', self.callback);
                });
            },

            'check log result': function (e, docs) {
                assert.isNull(e);
                assert.equal(_.size(docs), 1);
                assert.equal(docs[0].email, 'alice@domain.com');
            },

            'authenticate with new user': {
                topic: function () {
                    var self = this;

                    authService.authenticate({
                        email: 'alice@domain.com',
                        password: 'pass123'
                    }, function (resp) {
                        self.callback(null, resp);
                    });
                },

                'check auth result': function (e, resp) {
                    assert.isNotNull(resp);
                    assert.isString(resp.data.userId);
                }
            },

            'find user': {
                topic: function () {
                    var self = this;

                    authService.findUser({
                        email: 'alice@domain.com'
                    }, function (resp) {
                        self.callback(null, resp);
                    });
                },

                'check find user result': function (e, resp) {
                    assert.isNotNull(resp);
                    assert.equal(resp.data.code, 0);
                    assert.isString(resp.data.userId);
                }
            }
        }
    }
}).export(module);