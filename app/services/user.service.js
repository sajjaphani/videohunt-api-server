var mongoose = require('mongoose');

var User = mongoose.model('User');

// Returns a promise that will give a user record if exists
function getUserById(profileId) {
    return User.findOne({ profileId: profileId });
}

// Create a new user
function createUser(userObj) {
    return User.create(userObj);
}

module.exports = {
    getUserById,
    createUser
};
