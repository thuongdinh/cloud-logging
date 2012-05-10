/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    logRouter = require('./routes/log').LogRouter,
    authRouter = require('./routes/auth').AuthRouter,
    SimpleAuthService = require('./core/auth/simple-auth').Auth;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('string'));
    app.use(express.session({
        secret: "string"
    }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

    // config service
    app.authService = new SimpleAuthService(app);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Database info
app.dataURL = /*process.env.MONGOHQ_URL || */'mongodb://root:123456@flame.mongohq.com:27068';

// Routes
app.get('/', routes.index);
// config log router for Log REST API
logRouter(app);
authRouter(app);

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
