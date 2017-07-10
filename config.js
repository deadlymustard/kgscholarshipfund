var env = process.env.NODE_ENV || 'dev', cfg = require('./config.' + env + '.json');
module.exports = cfg;
