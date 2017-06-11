var hash = require('json-hash');
var handlebars = require('handlebars');
var fs = require('fs');

var config = {};


var mongoose = require('mongoose');     
// connection string using mongoose:
var uri = 'mongodb://regdshaner:itisme@' +
  'kgscholarship-shard-00-00-pjhb9.mongodb.net:27017,' +
  'kgscholarship-shard-00-01-pjhb9.mongodb.net:27017,' +
  'kgscholarship-shard-00-02-pjhb9.mongodb.net:27017/test' +
  '?ssl=true&replicaSet=kgscholarship-shard-0&authSource=admin';
mongoose.connect(uri);

// define model =================
var teamSchema = mongoose.Schema({
    hash: {type: String, unique : true, required : true, dropDups: true},
    name: String,
    email: String,
    phone: String,
    members: [],
    price: String,
    paid: false
});

teamSchema.static('findByHash', function (hash, callback) {
  return this.find({ hash: hash }, callback);
});

// Setup mail service
const nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'ktgwiff@gmail.com',
        pass: 'KevinGilbert'
    }
});


var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};


exports.index = function(req, res) {
  res.sendfile('./index.html'); // load the single view file (angular will handle the page changes on the front-end)
};

exports.register = function(req, res) {
	var data = req.body;
    console.log("Inbound JSON: " + console.log(req.body) );

    var hash_id = hash.digest(req.body);
    console.log("hash:" + hash_id);

    var response_data;

    var Team = mongoose.model('Team', teamSchema);

    var new_team = new Team({hash: hash_id, name: req.body.name, email: req.body.email,
                            phone: req.body.phone, members: req.body.members, price: req.body.price,
                            paid: false});

    new_team.save(function (err, new_team) {
      if (err) return console.error(err);


        readHTMLFile(__dirname + '/templates/email_confirmation.html', function(err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                 team_name: new_team.name,
                 team_email: new_team.email,
                 team_phone: new_team.phone,
                 team_members: new_team.members,
                 price_information: new_team.price,
                 payment_url: 'http://localhost:5000/#/register/team/' + new_team.hash
            };
            var htmlToSend = template(replacements);
            var mailOptionsCustomer = {
                from: 'ktgwiff@gmail.com', // sender address
                to: new_team.email, // list of receivers
                subject: 'Kevin Gilbert Wiffle Ball Tournament Registration Confirmation', // Subject line
                text: 'Test', // plain text body
                html : htmlToSend
             };
            transporter.sendMail(mailOptionsCustomer, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            });
        });

        //Send an email to Claire
        let mailOptionsInternal = {
            from: 'claire@kgscholarshipfund.com', // sender address
            to: 'regdshaner@gmail.com', // list of receivers
            subject: 'New Customer is registered.', // Subject line
            text: 'Hello world ?', // plain text body
            html: '<b>Hello world ?</b>' // html body
        };
/*
        transporter.sendMail(mailOptionsInternal, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
*/
         res.send(new_team);
    });
}

exports.register_team = function(req, res) {
	console.log('hi!');
  	var grabTeam = mongoose.model('Team', teamSchema);

  	console.log(req.params);
    console.log(req.params.team_id);

    grabTeam.findByHash(req.params.team_id, function(err, teams) {
        console.log(teams);
        res.send(teams[0]);
	});
};
