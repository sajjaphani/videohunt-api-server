const convict = require('convict');

const config = convict({
    http: {
        port: {
            doc: 'The port to listen on',
            default: 3000,
            env: 'PORT'
        }
    },
    authentication: {
        google: {
            clientId: {
                doc: "The Client ID from Google to use for authentication",
                default: "452703986085-o2b5i5k7he45051s55ut296bn1icu2m7.apps.googleusercontent.com",
                env: "GOOGLE_CLIENTID"
            },
            clientSecret: {
                doc: "The Client Secret from Google to use for authentication",
                default: "eEwUCUGQ5zcRRP8h68Wxjik9",
                env: "GOOGLE_CLIENTSECRET"
            }
        },
        facebook: {
            clientId: {
                doc: "The Client ID from Facebook to use for authentication",
                default: "619175788827743",
                env: "FACEBOOK_CLIENTID"
            },
            clientSecret: {
                doc: "The Client Secret from Facebook to use for authentication",
                default: "cff34a24936bf7eae7c17aca834f84a7",
                env: "FACEBOOK_CLIENTSECRET"
            }
        },
        token: {
            secret: {
                doc: 'The signing key for the JWT',
                default: 'mySuperSecretKey',
                env: 'JWT_SIGNING_KEY'
            },
            issuer: {
                doc: 'The issuer for the JWT',
                default: 'social-logins-spa'
            },
            audience: {
                doc: 'The audience for the JWT',
                default: 'social-logins-spa'
            }
        }
    }
});

config.validate();

module.exports = config;
