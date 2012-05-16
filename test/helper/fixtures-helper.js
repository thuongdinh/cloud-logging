var fixtures = require('mongodb-fixtures'),
    mongodb = require('mongodb');

var Fixture = module.exports = function (url, collection) {
    this.url = url;
    this.collection = collection;
};

var p = Fixture.prototype;

/**
 * Clean a collection of a db
 *
 * @param collection
 * @param callback
 */
p.clean = function (collection, callback) {
    collection = collection || this.collection;

    mongodb.Db.connect(this.url, function (e, db) {
        db.collection(collection, function (e, col) {
            col.remove({}, callback);
            db.close();
        });
    });
};

/**
 * Load fixture
 * @param callback
 */
p.loadFixtures = function (callback) {
    mongodb.Db.connect(this.url, function (e, db) {
        db.open = function (callback) {
            callback(null, db);
        };

        // override open method
        fixtures.load();
        fixtures.save(db, function () {
            db.close();
            if (callback)
                callback();
        });
    });
};

/**
 * Get all data to collection for testing purpose
 * @param collectionName
 * @param callback
 */
p.loadCollection = function (collectionName, callback) {

    mongodb.Db.connect(this.url, function (e, db) {
        if (e)
            callback(e, db);
        db.collection(collectionName, function (e, col) {
            if (e)
                callback(e, db);

            col.find({}).toArray(function (e, col) {
                callback(e, col);
                db.close();
            });

        });
    });
};