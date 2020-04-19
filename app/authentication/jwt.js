const passport = require('passport');
const { Strategy } = require('passport-jwt');

const config = require('../../config');
const { SESSION_COOKIE_NAME } = require('../util/misc');

const cookieExtractor = (req) => {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies[SESSION_COOKIE_NAME];
    }

    return token;
};

const jwtOptions = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: config.get('authentication.token.secret'),
    issuer: config.get('authentication.token.issuer'),
    audience: config.get('authentication.token.audience')
};

passport.use(new Strategy(jwtOptions, (payload, done) => {
    return done(null, payload);
}));
