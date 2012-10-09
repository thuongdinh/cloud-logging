/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    logRouter = require('./routes/log').LogRouter,
    authRouter = require('./routes/auth').AuthRouter,
    AuthService = require('./core/auth/db-auth').Auth;

var app = module.exports = express.createServer();
var mongo;

// config log
var log4js = require('log4js'),
    logger = log4js.getLogger();

// set log level base on environment variable
logger.setLevel(process.env.LOG_ENV || 'DEBUG');
app.logger = logger;

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
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

    mongo = {
        "hostname":"flame.mongohq.com",
        "port":27090,
        "username":"root",
        "password":"123456",
        "name":"",
        "db":"admin_user"
    };
});

app.configure('production', function(){
    app.use(express.errorHandler());

    var env = JSON.parse(process.env.VCAP_SERVICES);
    mongo = env['mongodb-1.8'][0]['credentials'];
});

// config services
// ---------------
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
var mongourl = generate_mongo_url(mongo);

// Authentication service
app.authInfo = {
    dataURL: mongourl,
    userCollection: 'user', // user collection
    appCollection: 'app' // user's app information
};
app.authService = new AuthService(app);

// log infor
// Database info
app.dataURL = mongourl;

// Routes
app.get('/', routes.index);
// config log router for Log REST API
logRouter(app);
authRouter(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port, function() {
    console.log("Listening on " + port);
});