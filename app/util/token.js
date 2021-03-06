const jwt = require('jsonwebtoken');
const config = require('../../config');

// Generate an Access Token for the given User ID
function generateAccessToken(user) {
    const expiresIn = '24h';
    const audience = config.get('authentication.token.audience');
    const issuer = config.get('authentication.token.issuer');
    const secret = config.get('authentication.token.secret');

    const token = jwt.sign(user, secret, {
        expiresIn: expiresIn,
        audience: audience,
        issuer: issuer,
        subject: user.profileId.toString()
    });

    return token;
}

module.exports = {
    generateAccessToken: generateAccessToken
}
