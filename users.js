// The actual database of users
const users = [
    {
        id: 0,
        name: 'Graham',
        providers: []
    }
];

// Get a single user by their Internal ID
function getUserById(id) {
    return users.find((u) =>
        u.id == id);
}

// Returns a promise that will give a user record if exists
function getUserByExternalId(User, profileId) {
    return User.findOne({profileId: profileId});
}

// Create a new user
function createUser(User, userObj) {
    return User.create(userObj);
}

module.exports = {
    getUserById: getUserById,
    getUserByExternalId: getUserByExternalId,
    createUser: createUser
};
