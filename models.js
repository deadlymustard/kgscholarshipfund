  var mongoose = require('mongoose');

  // Team model
  var Team = mongoose.Schema(
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
  Team.static('findByHash', function (hash, callback) {
    return this.find({ hash: hash }, callback);
  });
  Team.static('findByColor', function (color, callback) {
    return this.find({ color: color }, callback);
  });
  mongoose.model("Teams", Team);


  // Donation model
  var Donation = mongoose.Schema(
    {
      name: String,
      shirt_size: String
    }
  );

  // For storing username/password information
  var UserData = mongoose.Schema(
    {
      username: String,
      password: String
    }
  );

  // declare seat covers here too
  var models = {
    Team : mongoose.model('Teams', Team),
    Donation : mongoose.model('Donations', Donation),
    UserData : mongoose.model('UserDatas', UserData)
  };

