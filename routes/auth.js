var crypto = require('crypto');

var AuthRouter = function (app) {
    // Session-persisted message middleware

//    app.locals.use(function(req,res){
//      var err = req.session.error
//        , msg = req.session.success;
//      delete req.session.error;
//      delete req.session.success;
//      res.locals.message = '';
//      if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
//      if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
//    })

    // Generate a salt for the user to prevent rainbow table attacks
    // for better security take a look at the bcrypt c++ addon:
    // https://github.com/ncb000gt/node.bcrypt.js
    var users = {
      tj: {
          name: 'tj'
        , salt: 'randomly-generated-salt'
        , pass: hash('foobar', 'randomly-generated-salt')
      }
    };

    // Used to generate a hash of the plain-text password + salt
    function hash(msg, key) {
      return crypto
        .createHmac('sha256', key)
        .update(msg)
        .digest('hex');
    }

    // Authenticate using our plain-object database of doom!
    function authenticate(name, pass, fn) {
      if (!module.parent) console.log('authenticating %s:%s', name, pass);
      var user = users[name];
      // query the db for the given username
      if (!user) return fn(new Error('cannot find user'));
      // apply the same algorithm to the POSTed password, applying
      // the hash against the pass / salt, if there is a match we
      // found the user
      if (user.pass == hash(pass, user.salt)) return fn(null, user);
      // Otherwise password is invalid
      fn(new Error('invalid password'));
    }

    function restrict(req, res, next) {
      if (req.session.user) {
        next();
      } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
      }
    }

    app.get('/restricted', restrict, function(req, res){
      res.send('Wahoo! restricted area');
    });

    app.get('/login', function(req, res){
      if (req.session.user) {
        req.session.success = 'Authenticated as ' + req.session.user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
      }
      res.send('login');
    });

    app.get('/logout', function(req, res){
      // destroy the user's session to log them out
      // will be re-created next request
      req.session.destroy(function(){
        res.redirect('/');
      });
    });

    app.post('/login', function(req, res){
      console.log(req);
      authenticate(req.body.username, req.body.password, function(err, user){
          console.log(user);
        if (user) {
          // Regenerate session when signing in
          // to prevent fixation
          req.session.regenerate(function(){
            // Store the user's primary key
            // in the session store to be retrieved,
            // or in this case the entire user object
            req.session.user = user;
            res.redirect('back');
          });
        } else {
          req.session.error = 'Authentication failed, please check your '
            + ' username and password.'
            + ' (use "tj" and "foobar")';
          res.redirect('login');
        }
      });
    });
};

exports.AuthRouter = AuthRouter;