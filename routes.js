var paypal = require('paypal-rest-sdk');
var hash = require('json-hash');
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
        user: 'regdshaner@gmail.com',
        pass: 'wearenotyourkindofpeople0451'
    }
});


/*
 * GET home page.
 */

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

        //Send an email to the customer
        let mailOptionsCustomer = {
            from: 'claire@kgscholarshipfund.com', // sender address
            to: new_team.email, // list of receivers
            subject: 'Kevin Gilbert Scholarship Fund Confirmation', // Subject line
            text: 'Hello world ?', // plain text body
            html: '<b>Hello world ?</b>' // html body
        };
/*
        transporter.sendMail(mailOptionsCustomer, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
*/
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

exports.create = function(req, res){
	var payment = {
		"intent": "sale",
		"payer": {
			"payment_method": "paypal"
		},
		"redirect_urls": {
			"return_url": "http://localhost:8000/execute",
			"cancel_url": "http://localhost:8000/cancel"
		},
		"transactions": [{
		"amount": {
	 		"total": "5.00",
		  	"currency": "USD"
		},
		"description": "My awesome payment"
		}]
    };
	paypal.payment.create(payment, function (error, payment) {
		if (error) {
		  console.log(error);
		} else {
			if(payment.payer.payment_method === 'paypal') {
	      		req.session.paymentId = payment.id;
	      		var redirectUrl;
	      		for(var i=0; i < payment.links.length; i++) {
		        	var link = payment.links[i];
		        	if (link.method === 'REDIRECT') {
		          		redirectUrl = link.href;
		        	}
		      	}
	      	res.redirect(redirectUrl);
	    	}
		}   
	});
}

exports.execute = function(req, res) {
	console.log('hi 6!');
        var paymentId = req.session.paymentId;
        var payerId = req.param('PayerID');

        var details = { "payer_id": payerId };
        paypal.payment.execute(paymentId, details, function (error, payment) {
            if (error) {
                console.log(error);
            } else {
                res.send("Hell yeah!");
            }
    });	
};

exports.cancel = function(req, res) {
    res.send("The payment got canceled");
};

/*
 * SDK configuration
 */

exports.init = function(c){
  config = c;
  paypal.configure(c.api);
}