var Auth = exports.Auth = function (app) {

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

    if (username === 'admin' && password === '123456') {
        callback({
            data: {
                code: 0
            }
        });
    } else {
        callback({
            data: {
                code: 1,
                message: 'BadCredenticals'
            }
        });
    }
};