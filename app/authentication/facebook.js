const passport = require('passport');
const { Strategy } = require('passport-facebook');

const config = require('../../config');
const { getUserById } = require('../services/user.service');

const passportConfig = {
    clientID: config.get('authentication.facebook.clientId'),
    clientSecret: config.get('authentication.facebook.clientSecret'),
    callbackURL: 'http://localhost:3000/api/v1/authentication/facebook/redirect',
    passReqToCallback: true,
    profileFields: ['emails', 'displayName', 'profileUrl', 'photos', 'name']
};

if (passportConfig.clientID) {
    passport.use(new Strategy(passportConfig, function (req, accessToken, refreshToken, profile, done) {
        getUserById(profile.id)
            .then(doc => {
                if (doc) {
                    return doc;
                } else {
                    const user = {
                        profileId: profile.id,
                        name: profile.displayName,
                        provider: profile.provider,
                    }
                    return users.createUser(user);
                }
            })
            .then(user => {
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
