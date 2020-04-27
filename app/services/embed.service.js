const { getProvider, getSupportedProviders } = require('../oembed/oembed-providers');
const { parseUrl } = require('../util/url-parser');
const { get } = require('../util/http-util')

function getEmbedProvider(urlString) {
    const promise = new Promise((resolve, reject) => {
        const _url = parseUrl(urlString);
        if (_url) {
            const provider = getProvider(_url.host);
            if (!provider) {
                const validationError = {
                    status: 'error',
                    error: {
                        type: "UnsupportedProvider",
                        message: "The provider is Unsupported.",
                        code: 100102
                    }
                };
                return reject(validationError);
            } else {
                return resolve(provider);
            }
        } else {
            const validationError = {
                status: 'error',
                error: {
                    type: "InvalidUrl",
                    message: "Invalid URL",
                    code: 100101
                }
            };
            return reject(validationError);
        }
    });

    return promise;
}

function fetchOEmbed(url) {
    return getEmbedProvider(url)
        .then(provider => {
            return provider.getOEmbed(url);
        });
}

function getProviders() {
    return getSupportedProviders();
}

module.exports = {
    getEmbedProvider, fetchOEmbed, getProviders
};