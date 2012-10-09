var responseHelper = require('../core/helper/response');

var AuthRouter = function (app) {
    // Session-persisted message middleware
    var authService = app.authService,
        logger = app.logger,
        AUTH_ROUTER = '/api/auth';

    if (!authService)
        throw "authService cannot be null";

    app.get('/restricted', authService.restrict, function(req, res){
        res.json(responseHelper.genSuccessResp());
    });

    /**
     * Create a user
     */
    app.post(AUTH_ROUTER, function(req, res){
        logger.debug('Create User with email: ', req.body.email, ', password: ', req.body.password);
        authService.createUser({
            email: req.body.email,
            password: req.body.password,
            metadata: req.body.metadata
        }, function (resp) {
            if (resp.data.code === 0) {
                logger.debug('Create user success with id: ', resp.data.userId);
            } else {
                logger.error('Create user fail with error: ', resp.data.code, ', message: ', resp.data.message);
            }

            // response result
            res.json(resp);
        });
    });

    app.post('/logout', function(req, res){
        logger.info('User logout ', JSON.stringify(req.session.user || {}));
        // destroy the user's session to log them out
        // will be re-created next request
        req.session.destroy(function(){
            res.json(responseHelper.genSuccessResp());
        });
    });

    app.post('/login', function(req, res){

        logger.info('User login ', req.body.email);

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        authService.authenticate({
            email: req.body.email,
            password: req.body.password
        }, function(resp){
            if (responseHelper.isSuccessResp(resp)) {
                // Regenerate session when signing in
                // to prevent fixation
                req.session.regenerate(function(){
                    // Store the user's primary key
                    // in the session store to be retrieved,
                    // or in this case the entire user object
                    req.session.user = {
                        userId: resp.data.userId
                    };
                    res.json(resp);
                });
            } else {
                req.session.error = 'Authentication failed, please check your '
                + ' username and password.'
                + ' (use "tj" and "foobar")';
                res.json(resp);
            }
        });
    });
};

exports.AuthRouter = AuthRouter;