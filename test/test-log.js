var vows = require('vows'),
    assert = require('assert'),
    Fixtures = require('./helper/fixtures-helper');

fixturesHelper = new Fixtures('mongodb://root:123456@flame.mongohq.com:27089/log_test');
//fixturesHelper.loadFixtures(function() {
//    console.log('success');
//});
fixturesHelper.clean('log');

//vows.describe('Test vows').addBatch({
//   'when start': {
//       topic: function () {
//           return 42/0;
//       },
//
//       'we get Infinity': function (topic) {
//           assert.equal (topic, Infinity);
//       }
//   }
//}).export(module);