// Returns a promise that will give a user record if exists
function getUserById(User, profileId) {
    return User.findOne({profileId: profileId});
}

// Create a new user
function createUser(User, userObj) {
    return User.create(userObj);
}

module.exports = {
    getUserById: getUserById,
    createUser: createUser
};
