var mongoose = require('mongoose'); 
var hash = require('json-hash');

var cfg = require('./config');
var mailer = require('./mailer')
var logger = require('./logger');


// Setup DB Connection and connect
var uri = 'mongodb://regdshaner:' + process.env.MONGO_PASSWORD + '@' +
  'kgscholarship-shard-00-00-pjhb9.mongodb.net:27017,' +
  'kgscholarship-shard-00-01-pjhb9.mongodb.net:27017,' +
  'kgscholarship-shard-00-02-pjhb9.mongodb.net:27017/' + cfg.mongoDatabaseName +
  '?ssl=true&replicaSet=kgscholarship-shard-0&authSource=admin';
mongoose.connect(uri);

// Database Model
var teamSchema = mongoose.Schema(
  {
    hash: { type: String, unique : true, required : true, dropDups: true },
    name: String,
    email: String,
    phone: String,
    color: String,
    members: [],
    price: String,
    league: String,
    paid: false
  }
);
teamSchema.static('findByHash', function (hash, callback) {
  return this.find({ hash: hash }, callback);
});
teamSchema.static('findByColor', function (color, callback) {
  return this.find({ color: color }, callback);
});


var orderSchema = mongoose.Schema(
  {
    name: String,
    shirts: []
  }
);


// Initial Page Load
exports.index = function(req, res) {
  logger.info("Hello!");
  res.sendfile('./index.html'); // load the single view file (angular will handle the page changes on the front-end)
};

// Register a new team
exports.register = function(req, res) {

  // Grab data from body and generated a hash
  var data = req.body;
  logger.info("Inbound JSON: " + logger.info(req.body));
  var hash_id = hash.digest(req.body);
  logger.info("Generated Hash:" + hash_id);

  // Create a new team based on the incoming request data
  var Team = mongoose.model('Team', teamSchema, 'teams');
  var new_team = new Team(
    {
      hash: hash_id, 
      name: req.body.name, 
      email: req.body.email,
      phone: req.body.phone, 
      members: req.body.members, 
      color: req.body.color, 
      price: req.body.price, 
      league: req.body.league,
      paid: false
    }
  );

  // Save new team to database
  new_team.save(function (err, new_team) {
    if (err) return logger.error("Error saving team to DB:\n" + err);

      var host = req.headers.host;
      logger.info("New team '" + new_team.name + "' saved to database.");
      logger.info("Current Host: " + host);
      logger.info("Members: " + new_team.members[0]);

      // Define replacements
      var replacements = {
        team_name: new_team.name,
        team_email: new_team.email,
        team_phone: new_team.phone,
        team_members: new_team.members[0],
        price_information: new_team.price,
        payment_url: 'http://' + host + '/#/register/team/' + new_team.hash
      };

      // Define mail option metadata
      var mailOptions = {
        from: 'ktgwiff@gmail.com', 
        to: new_team.email,  
        subject: 'Kevin Gilbert Wiffle Ball Tournament Registration Confirmation'
      };

      // Send confirmation e-mail to customer
      mailer.sendMailTemplate('/templates/email_confirmation.html', replacements, mailOptions , function(err) {
        if (err) return logger.error("Error sending confirmation mail template:\n" + err);
      });

      // Send registration email to host
      mailOptions.to = cfg.confirmationEmailTarget;
      mailer.sendMailTemplate('/templates/email_registered.html', replacements, mailOptions, function(err) {
        if (err) return logger.error("Error sending registered mail template:\n" + err);
      });

      res.send(new_team);   
  });
}

// Register a new team
exports.order = function(req, res) {

  // Grab data from body and generated a hash
  var data = req.body;
  logger.info("Inbound JSON: " + logger.info(req.body));

  var Order = mongoose.model('Order', orderSchema, 'orders');
  var new_order = new Order(
    {
    name: req.body.name,
    email: req.body.email,
    shirts: req.body.shirts
    }
  );

  // Save new team to database
  new_order.save(function (err, new_order) {
    if (err) return logger.error("Error saving order to DB:\n" + err);

      var host = req.headers.host;
      logger.info("New order '" + new_order.name + "' saved to database.");
      logger.info("Current Host: " + host);
      logger.info("Members: " + new_order.shirts[0]);

      // Define replacements
      var replacements = {
        order_name: new_order.name,
        order_emai: new_order.email,
        order_shirts: new_order.shirts[0]
      };

      // Define mail option metadata
      var mailOptions = {
        from: 'ktgwiff@gmail.com', 
        to: new_order.email,  
        subject: 'Kevin Gilbert Wiffle Ball Tournament Registration Confirmation'
      };

      // Send confirmation e-mail to customer
      mailer.sendMailTemplate('/templates/order_confirmation.html', replacements, mailOptions , function(err) {
        if (err) return logger.error("Error sending confirmation mail template:\n" + err);
      });

      // Send registration email to host
      mailOptions.to = cfg.confirmationEmailTarget;
      mailer.sendMailTemplate('/templates/order_confirmation.html', replacements, mailOptions, function(err) {
        if (err) return logger.error("Error sending registered mail template:\n" + err);
      });

      res.send(new_order);   
  });
}

// Register a new team
exports.register_team = function(req, res) {
  logger.info('hi!');
  var grabTeam = mongoose.model('Team', teamSchema);

  logger.info("Incoming parameters: " + req.params);
  logger.info("Incoming team_id: " + req.params.team_id);

  grabTeam.findByHash(req.params.team_id, function(err, teams) {
    logger.info(teams);
    res.send(teams[0]);
  });
};

// Check to see if a color exists
exports.color = function(req, res) {
    var grabTeam = mongoose.model('Team', teamSchema);

    grabTeam.findByColor(req.params.color, function(err, teams) {
        if(teams.length > 0) {
            res.send('false');
        } else {
            res.send('true');
        }
    });
};

// Update a team to status of 'paid'
exports.pay = function(req, res) {

    var grabTeam = mongoose.model('Team', teamSchema);

    logger.info(req.params.team_id);

    grabTeam.findOneAndUpdate({hash: req.params.team_id}, { $set: {paid: true}}, function(err, team) {
        if(err) return logger.info(err);

        logger.info("***UPDATED TEAM***\n" + team);

        res.send(team);
    });
};