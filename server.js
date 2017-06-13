// server.js

    // set up ========================
    var http = require('http');
    var express  = require('express');
    var routes = require('./routes');                       // create our app w/ express
  
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var assert = require('assert');
    var session = require('express-session');
    const cors = require('cors')


    var app = express()



    // Setup config
    var fs = require('fs');
    try {
      var configJSON = fs.readFileSync(__dirname + "/config.json");
      var config = JSON.parse(configJSON.toString());
    } catch (e) {
      console.error("File config.json not found or is invalid: " + e.message);
      process.exit(1);
    }

//...
    const corsOptions = {
        origin: 'http://localhost:5000'
    }

    
    app.set('port', config.port || process.env.PORT);
    app.use(cors(corsOptions))   
    app.use(express.static(__dirname + '/'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());
    app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true }
    }));
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
    app.use(methodOverride());

    app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
     // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
    });



    app.get('/', routes.index);
    app.post('/register', routes.register);
    app.get('/register/team/:team_id', routes.register_team);
    app.get('/team/color/:color', routes.color);
    app.get('/team/pay/:team_id', routes.pay);

    // listen (start app with node server.js) ======================================
    http.createServer(app).listen(process.env.PORT || 5000);


