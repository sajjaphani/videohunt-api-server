var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    'name': String, // name
    'provider': String, // facebook, google or twitter
    'profileId': { 
        type: String,
        unique: true
    }, // ID from auth provider
    'email': {
        type: String,
        lowercase: true
    },
    'memberSince': {
        type: Date,
        default: Date.now
    },
});

UserSchema.index({ profileId: 1 }, { unique: true });

UserSchema.statics.findUsers = function (users, callback) {
    this.find({
                '_id': {
                    $in: users
                }
            }, function (err, users) {
              callback(err, users)
          })
}

module.exports = UserSchema