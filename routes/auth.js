var responseHelper = require('../core/helper/response');

var AuthRouter = function (app) {
    // Session-persisted message middleware
    var authService = app.authService;

    if (!authService)
        throw "authService cannot be null";

    app.get('/restricted', authService.restrict, function(req, res){
        res.json(responseHelper.genSuccessResp());
    });

    app.post('/logout', function(req, res){
        // destroy the user's session to log them out
        // will be re-created next request
        req.session.destroy(function(){
            res.json(responseHelper.genSuccessResp());
        });
    });

    app.post('/login', function(req, res){
        authService.authenticate({
            username: req.body.username,
            password: req.body.password
        }, function(resp){
            console.log(resp);
            if (responseHelper.isSuccessResp(resp)) {
                // Regenerate session when signing in
                // to prevent fixation
                req.session.regenerate(function(){
                    // Store the user's primary key
                    // in the session store to be retrieved,
                    // or in this case the entire user object
                    req.session.user = resp.data.user;
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