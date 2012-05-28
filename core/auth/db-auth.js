var ERROR = require('../const/code').ERROR,
    responseHelper = require('../helper/response'),
    check = require('validator').check,
    mongodb = require('mongodb'),
    uuid = require('node-uuid'),
    encrypt = require('../helper/encrypt');

// Generate a salt for the user to prevent rainbow table attacks
// for better security take a look at the bcrypt c++ addon:
// https://github.com/ncb000gt/node.bcrypt.js
var SHA1_PRIVATE_KEY = '048abcf0-a865-11e1-afa6-0800200c9a66';

/**
 * @constructor
 */
var Auth = exports.Auth = function (app) {
    this.app = app;
    this.authInfo = app.authInfo;
};

var p = Auth.prototype;

/**
 * Private connect to db
 * @param callback
 */
p._connect = function (callback) {
    var self = this;

    if (this._db) {
        callback(null, this._db);
    } else {
        mongodb.Db.connect(this.authInfo.dataURL, function (e, db) {
            if (!e)
                self._db = db;

            callback(e, db);
        });
    }

};

/**
 * Create user
 * @param {Object} opt Include:
 *  {
 *      email,
 *      password,
 *      metadata
 *  }
 * @param {Function} callback The callback function
 */
p.createUser = function (opt, callback) {
    opt = opt || {};
    var self = this,
        email = opt.email,
        password = opt.password,
        metadata = opt.metadata || {};

    try {
        check(email).notEmpty() &&
        check(password).notEmpty();

        this.findUser({
            email: email
        }, function (resp) {
            if (resp.data.userId) { // user existed
                callback(responseHelper.genErrorResp(ERROR.USER_EXISTED));
            } else {
                // create new user
                self._connect(function (e, db) {
                    db.collection(self.authInfo.userCollection, function (err, col) {
                        col.save({
                            userId: uuid.v4(),
                            email: email,
                            password: encrypt.hash(password, SHA1_PRIVATE_KEY), // password need be protected
                            metadata: metadata
                        }, {safe: true}, function (e, result) {
                            if (e) {
                                callback(responseHelper.genErrorResp(ERROR.WRONG_USER_DATA));
                            } else {
                                callback(responseHelper.genSuccessResp({
                                    userId: result._id
                                }));
                            }
                        });
                    });
                });
            }
        });

    } catch (e) {
        callback(responseHelper.genErrorResp(ERROR.WRONG_USER_DATA));
    }
};

/**
 * Find a User
 * @param opt
 * {
 *      email
 * }
 * @param callback
 */
p.findUser = function (opt, callback) {
    var self = this;

    this._connect(function (e, db) {
        db.collection(self.authInfo.userCollection, function (err, col) {
            col.findOne(opt, function (e, result) {
                if (e || !result || !result._id) {
                    callback(responseHelper.genErrorResp(ERROR.USER_ISNOT_EXISTED));
                } else {
                    callback(responseHelper.genSuccessResp({
                        userId: result.userId,
                        publicKey: result.password
                    }));
                }
            });
        });
    });
};

/**
 * Do authentication
 * @param {Object} opt Include:
 *  {
 *      email,
 *      password
 *  }
 * @param {Function} callback The callback function
 */
p.authenticate = function (opt, callback) {
    opt = opt || {};
    var email = opt.email,
        password = opt.password;

    try {
        check(email).notEmpty() &&
        check(password).notEmpty();

        // find user and validate password with public key
        this.findUser({
            email: email
        }, function (resp) {
            if (resp.data.code === 0 && resp.data.publicKey === encrypt.hash(password, SHA1_PRIVATE_KEY)) {
                callback(responseHelper.genSuccessResp({
                    userId: resp.data.userId
                }));
            } else {
                callback(responseHelper.genErrorResp(ERROR.BAD_CREDENTICALS));
            }
        });
    } catch (e) {
        callback(responseHelper.genErrorResp(ERROR.BAD_CREDENTICALS));
    }
};

/**
 * Restrict a request
 *
 * @param req
 * @param res
 * @param next
 */
p.restrict = function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        responseHelper.sendError(res, ERROR.HAVE_NOT_PERMISSION);
    }
};