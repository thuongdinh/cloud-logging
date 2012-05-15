var vows = require('vows'),
    assert = require('assert'),
    fixtures = require('mongodb-fixtures'),
    mongodb = require('mongodb');

mongodb.Db.connect('mongodb://root:123456@flame.mongohq.com:27089/log_test', function (e, db) {
    db.open = function (callback) {
        callback(null, db);
    };

    // override open method
    fixtures.load();
    fixtures.save(db, function () {
        db.close();
    });
});


//
//fixtures.load();
//fixtures.save(db, function () {
//   //db.close();
//   console.log(db);
//   db.collection('log', function (err, col) {
//       col.find().toArray(function (err, docs) {
//           console.dir(docs);
//           db.close();
//       });
//   });
//   //console.log(fixtures);
//});

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