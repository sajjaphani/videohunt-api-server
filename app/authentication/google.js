const passport = require('passport');
const passportGoogle = require('passport-google-oauth');

const config = require('../../config');
const users = require('../services/users');

const passportConfig = {
    clientID: config.get('authentication.google.clientId'),
    clientSecret: config.get('authentication.google.clientSecret'),
    callbackURL: 'http://localhost:3000/api/authentication/google/redirect',
    passReqToCallback: true,
    profileFields: ['emails', 'displayName', 'profileUrl', 'photos', 'name']
};

if (passportConfig.clientID) {
    passport.use(new passportGoogle.OAuth2Strategy(passportConfig, function (request, accessToken, refreshToken, profile, done) {
        let models = request.app.get('models')
        users.getUserById(models.User, profile.id).then(doc => {
            if (doc) {
                return doc;
            } else {
                profile.displayName, 'google', profile.id
                const user = {
                    name: profile.name.givenName,
                    provider: 'google',
                    profileId: profile.id,
                    email: profile.email
                }
                return users.createUser(models.User, user);
            }
        })
            .then(user => {
                let transformedUser = {
                    id: user.id,
                    profileId: user.profileId,
                    name: profile.name.givenName,//user.name,
                    provider: 'google',
                    picture: profile.photos ? profile.photos[0].value : '/images/logo.png'
                };
                done(null, transformedUser);
            })
            .catch(err => {
                done(err, false);
            });
    }));
}
