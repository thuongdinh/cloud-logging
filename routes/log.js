var LogPersistent = require('../core/log/log-persistent').LogPersistent;

var LogRouter = function (app) {
    var LOG_ROUTER = '/api/log/:userId/:app',
        logPersistent = new LogPersistent(app),
        authSevice = app.authService;

    // config routers
    // Get api
    app.get(LOG_ROUTER, function(req, res){
        res.send({
            message:'Get: TODO'
        });
    });

    // Create api
    app.post(LOG_ROUTER, authSevice.restrict, function(req, res){
        var data = req.body,
            userId = req.params.userId,
            app = req.params.app,
            level = data.level,
            message = data.message;

        // log
        logPersistent.log({
            level: level,
            message: message,
            userId: userId,
            app: app
        });
        res.send('');
    });

    // Update api
    app.put(LOG_ROUTER, function(req, res){
        res.send({
            message:'Update: TODO'
        });
    });

    // Create api
    app.delete(LOG_ROUTER, function(req, res){
        res.send({
            message:'Delete: TODO'
        });
    });
};

exports.LogRouter = LogRouter;