// server.js
var cfg = require('./config');
var logger = require('./logger.js');
var routes = require('./routes');                               // Use REST API's defined in routes   

var gulp = require('gulp');   
var http = require('http');
var express  = require('express');
var morgan = require('morgan');                                 // log requests to the console (express4)
var bodyParser = require('body-parser');                        // pull information from HTML POST (express4)
var session = require('express-session');

var app = express();

// Load Gulp Config
require('./gulpfile.js');                                       
gulp.start('js');

// Set port and static serve directory
app.set('port', cfg.port || process.env.PORT);                  
app.use(express.static(__dirname + '/'));                       

// Log every request to the console
logger.debug("Overriding 'Express' logger");
app.use(morgan('dev'));                  

logger.debug("Setting up body parser");
// Setting up body parser
app.use(bodyParser.urlencoded({'extended':'true'}));            
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json'})); 

logger.debug("Setting up session");
// Setting up session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

logger.debug("Setting up routes");
// Setting up routes
app.get('/', routes.index);
app.post('/register', routes.register);
app.get('/register/team/:team_id', routes.register_team);
app.get('/team/color/:color', routes.color);
app.get('/team/pay/:team_id', routes.pay);

// listen (start app with node server.js) ======================================
http.createServer(app).listen(process.env.PORT || 5000);


