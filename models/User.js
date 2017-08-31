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

UserSchema.statics.findUsers = function (userIds, callback) {
    this.find({
        '_id': {
            $in: userIds
        }
    }, function (err, users) {
        callback(err, users)
    })
}

UserSchema.statics.getUserFeed = function (userIds, callback) {
    
    let queryObj = {
        '_id': {
            $in: userIds
        }
    }
    this.find(queryObj).exec().then(function (users) {
        console.log('kjfjd')
        var userFeed = users.reduce(function (users, user) {
            users[user._id] = user
            return users
        }, {});
        console.log(userFeed)
        callback(userFeed)
    }).then(undefined, function (err) {
        callback(err)
    });
}

UserSchema.statics.getUsersPromise = function (userIds) {
    let queryObj = {
        '_id': {
            $in: userIds
        }
    }
    return this.find(queryObj).exec()
}

module.exports = UserSchema