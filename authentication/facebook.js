const passport = require('passport');
const passportFacebook = require('passport-facebook');
const Promise = require('bluebird');
const config = require('../config');
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
        let models = req.app.get('models')
        users.getUserById(models.User, profile.id).then(doc => {
            if(doc) {
                return doc;
            } else {
                profile.displayName, 'facebook', profile.id
                const user = {
                    name: profile.name.givenName,
                    provider: 'facebook',
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
                provider: 'facebook',
                picture: profile.photos ? profile.photos[0].value : '/images/logo.png'
            };
            done(null, transformedUser);
        })
        .catch(err => {
            done(err, false);
        });
        
    }));
}
