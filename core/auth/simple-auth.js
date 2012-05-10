var ERROR = require('../const/code').ERROR,
    responseHelper = require('../helper/response'),
    encrypt = require('../helper/encrypt');

// Generate a salt for the user to prevent rainbow table attacks
// for better security take a look at the bcrypt c++ addon:
// https://github.com/ncb000gt/node.bcrypt.js
var users = {
    admin: {
        name: 'admin'
        , salt: 'randomly-generated-salt'
        , pass: encrypt.hash('123456', 'randomly-generated-salt')
    }
};

/**
 * @constructor
 */
var Auth = exports.Auth = function (app) {
    this.app = app;
};

var p = Auth.prototype;

/**
 * Do authentication
 * @param {Object} opt Include:
 *  {
 *      username,
 *      password
 *  }
 * @param {Function} callback The callback function
 */
p.authenticate = function (opt, callback) {
    opt = opt || {};
    var username = opt.username,
        password = opt.password;

    var user = users[username];

    if (user && user.pass == encrypt.hash(password, user.salt)) {
        callback(responseHelper.genSuccessResp({
            user: user
        }));
    } else {
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