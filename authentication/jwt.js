const passport = require('passport');
const passportJwt = require('passport-jwt');
const config = require('../config');
const users = require('../services/users');

const jwtOptions = {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeader(),
    secretOrKey: config.get('authentication.token.secret'),
    issuer: config.get('authentication.token.issuer'),
    audience: config.get('authentication.token.audience')
};

passport.use(new passportJwt.Strategy(jwtOptions, (payload, done) => {
    return done(null, payload);
}));
