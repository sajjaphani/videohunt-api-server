const passport = require('passport');
const passportFacebook = require('passport-facebook');
const Promise = require('bluebird');
const config = require('../config');
const users = require('../users');


const passportConfig = {
    clientID: config.get('authentication.facebook.clientId'),
    clientSecret: config.get('authentication.facebook.clientSecret'),
    callbackURL: 'http://localhost:3000/api/v1/authentication/facebook/redirect',
    passReqToCallback: true,
    profileFields: ['emails', 'displayName', 'profileUrl']
};

if (passportConfig.clientID) {
    passport.use(new passportFacebook.Strategy(passportConfig, function (req, accessToken, refreshToken, profile, done) {
        let models = req.app.get('models')

        
        users.getUserByExternalId(models.User, profile.id).then(doc => {
            if(doc) {
                return doc;
            } else {
                profile.displayName, 'facebook', profile.id
                const user = {
                    name: profile.displayName,
                    provider: 'facebook',
                    profileId: profile.id,
                    email: profile.email
                }
                return users.createUser(models.User, user);
            }
        })
        .then(doc => {
            done(null, doc);
        })
        .catch(err => {
            done(err, null);
        });
      
    }));
}
