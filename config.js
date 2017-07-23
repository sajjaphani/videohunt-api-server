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
            "clientId": {
                "doc": "The Client ID from Google to use for authentication",
                "default": "120111556266-q8s0oovd0laof0onc0lc6hr1sq48arca.apps.googleusercontent.com",
                "env": "GOOGLE_CLIENTID"
            },
            "clientSecret": {
                "doc": "The Client Secret from Google to use for authentication",
                "default": "8cxLBD0nCq7P3HNp7fSKRfas",
                "env": "GOOGLE_CLIENTSECRET"
            }
        },
        facebook: {
            "clientId": {
                "doc": "The Client ID from Facebook to use for authentication",
                "default": "859786510843962",
                "env": "FACEBOOK_CLIENTID"
            },
            "clientSecret": {
                "doc": "The Client Secret from Facebook to use for authentication",
                "default": "7a79a023e3f6ff0f95b312f31a8bfcac",
                "env": "FACEBOOK_CLIENTSECRET"
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
