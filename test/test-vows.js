var vows = require('vows'),
    assert = require('assert');

vows.describe('Test vows').addBatch({
   'when start': {
       topic: function () {
           return 42/0;
       },

       'we get Infinity': function (topic) {
           assert.equal (topic, Infinity);
       }
   }
}).export(module);