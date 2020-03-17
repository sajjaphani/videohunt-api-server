var mongoose = require('mongoose');

var User = mongoose.model('User');

function getUserById(profileId) {
    return User.findOne({ profileId: profileId });
}

function createUser(userObj) {
    return User.create(userObj);
}

function createOrUpdateUser(query, userObj) {
    return User.createOrUpdate(query, userObj);
}

module.exports = {
    getUserById,
    createUser,
    createOrUpdateUser
};
