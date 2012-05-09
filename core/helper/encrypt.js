var crypto = require('crypto');

/**
 * Used to generate a hash of the plain-text password + salt
 * @param msg
 * @param key
 */
function hash(msg, key) {
    return crypto
            .createHmac('sha256', key)
            .update(msg)
            .digest('hex');
}

// Exports
//--------------
module.exports = {
    hash: hash
};