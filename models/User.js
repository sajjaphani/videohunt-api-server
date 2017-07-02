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

module.exports = UserSchema