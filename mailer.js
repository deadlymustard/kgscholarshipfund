var handlebars = require('handlebars');
var logger = require('winston');
var fs = require('fs');


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

exports.sendMailTemplate = function(path, replacements, mailOptions, callback) {
	readHTMLFile(__dirname + path, function(err, html) {
        var template = handlebars.compile(html);
        var htmlToSend = template(replacements);
        mailOptions.html = htmlToSend;
        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            logger.info(error);
            return error;
        }
        logger.info('Message %s sent: %s', info.messageId, info.response);
        });
    });
}