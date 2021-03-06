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

UserSchema.statics.findUsers = function (userIds) {
    return this.find({
        '_id': {
            $in: userIds
        }
    });
}

UserSchema.statics.getUserFeedPromise = function (userIds) {
    let queryObj = {
        '_id': {
            $in: userIds
        }
    };
    return this.find(queryObj).exec().then(function (users) {
        var userFeed = users.reduce(function (users, user) {
            users[user._id] = user
            return users
        }, {});

        return userFeed;
    })
}

mongoose.model('User', UserSchema);
