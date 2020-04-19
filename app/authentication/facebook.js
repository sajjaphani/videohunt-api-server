const passport = require('passport');
const { Strategy } = require('passport-facebook');

const config = require('../../config');
const { createOrUpdateUser } = require('../services/user.service');
const { getClientBaseUrl } = require('../util/host-utils');

const passportConfig = {
    clientID: config.get('authentication.facebook.clientId'),
    clientSecret: config.get('authentication.facebook.clientSecret'),
    callbackURL: getClientBaseUrl() + '/api/v1/authentication/facebook/redirect',
    passReqToCallback: true,
    profileFields: ['emails', 'displayName', 'profileUrl', 'photos', 'name']
};

if (passportConfig.clientID) {
    passport.use(new Strategy(passportConfig, function (req, accessToken, refreshToken, profile, done) {
        const query = { profileId: profile.id };
        const user = {
            profileId: profile.id,
            name: profile.displayName,
            provider: profile.provider,
            picture: profile.photos ? profile.photos[0].value : '/images/user.png'
        };

        createOrUpdateUser(query, user)
            .then(user => {
                let transformedUser = {
                    id: user.id,
                    profileId: user.profileId,
                    name: profile.displayName,
                    provider: user.provider,
                    picture: profile.photos ? profile.photos[0].value : user.picture
                };
                done(null, transformedUser);
            })
            .catch(err => {
                console.log('err', err);
                done(err, false);
            });
    }));
}
