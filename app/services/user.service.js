var mongoose = require('mongoose');

var User = mongoose.model('User');
var Subscription = mongoose.model('Subscription');

function getUserById(profileId) {
    return User.findOne({ profileId: profileId });
}

function createUser(userObj) {
    return User.create(userObj);
}

function createOrUpdateUser(query, userObj) {
    return User.createOrUpdate(query, userObj);
}

function addSubscription(email) {
    return Subscription.createSubscription(email);
}

module.exports = {
    getUserById,
    createUser,
    createOrUpdateUser,
    addSubscription
};
