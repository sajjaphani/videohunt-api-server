const passport = require('passport');
const passportFacebook = require('passport-facebook');

const config = require('../../config');
const users = require('../services/users');

const passportConfig = {
    clientID: config.get('authentication.facebook.clientId'),
    clientSecret: config.get('authentication.facebook.clientSecret'),
    callbackURL: 'http://localhost:3000/api/v1/authentication/facebook/redirect',
    passReqToCallback: true,
    profileFields: ['emails', 'displayName', 'profileUrl', 'photos', 'name']
};

if (passportConfig.clientID) {
    passport.use(new passportFacebook.Strategy(passportConfig, function (req, accessToken, refreshToken, profile, done) {
        // console.log('Profile', JSON.stringify(profile));
        users.getUserById(profile.id)
            .then(doc => {
                if (doc) {
                    return doc;
                } else {
                    // console.log('Profile', profile);
                    const user = {
                        profileId: profile.id,
                        name: profile.displayName,
                        provider: profile.provider,
                    }
                    return users.createUser(user);
                }
            })
            .then(user => {
                // console.log('User', user);
                let transformedUser = {
                    id: user.id,
                    profileId: user.profileId,
                    name: profile.displayName,
                    provider: user.provider,
                    picture: profile.photos ? profile.photos[0].value : '/images/logo.png'
                };
                done(null, transformedUser);
            })
            .catch(err => {
                done(err, false);
            });
    }));
}
