const passport = require('passport');
const { Strategy } = require('passport-jwt');
const { ExtractJwt } = require('passport-jwt');

const config = require('../../config');

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: config.get('authentication.token.secret'),
    issuer: config.get('authentication.token.issuer'),
    audience: config.get('authentication.token.audience')
};

passport.use(new Strategy(jwtOptions, (payload, done) => {
    return done(null, payload);
}));
