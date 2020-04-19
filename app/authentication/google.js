const passport = require('passport');
const { OAuth2Strategy } = require('passport-google-oauth');

const config = require('../../config');
const { createOrUpdateUser } = require('../services/user.service');

const { getClientBaseUrl } = require('../util/host-utils');

const passportConfig = {
    clientID: config.get('authentication.google.clientId'),
    clientSecret: config.get('authentication.google.clientSecret'),
    callbackURL: getClientBaseUrl() + '/api/authentication/google/redirect',
    passReqToCallback: true,
    profileFields: ['emails', 'displayName', 'profileUrl', 'photos', 'name']
};

if (passportConfig.clientID) {
    passport.use(new OAuth2Strategy(passportConfig, function (request, accessToken, refreshToken, profile, done) {
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
