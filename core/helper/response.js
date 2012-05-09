var SUCCESS = require('../const/code').SUCCESS,
    _ = require('underscore');

/**
 * Send error message
 *
 * @param {const/error_code.ERROR} error The error data
 */
function sendError (res, error) {
    res.json(genErrorResp(error));
};

/**
 * Generate error json data
 * @param error
 */
function genErrorResp (error) {
    return { data: error };
};

/**
 * Generate error json data
 * @param error
 */
function genSuccessResp (data, successCode) {
    successCode = successCode || SUCCESS.NORMAL;
    data = data || {};

    return {
        data: _.extend(data, successCode)
    };
};

/**
 * Check if response is success
 * @param resp
 */
function isSuccessResp (resp) {
    return resp.data.code === 0;
};

// Exports
//--------------
module.exports = {
    sendError: sendError,
    genErrorResp: genErrorResp,
    genSuccessResp: genSuccessResp,
    isSuccessResp: isSuccessResp
};