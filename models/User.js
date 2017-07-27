var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    'name': String, // name
    'headline': String, // headline
    'email': {
        type: String,
        unique: true,
        lowercase: true
    },
    'memberSince': {
        type: Date,
        default: Date.now
    },
});

UserSchema.index({ email: 1 }, { unique: true });

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