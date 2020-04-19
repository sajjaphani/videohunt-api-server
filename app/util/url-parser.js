const { URL } = require('url');

const protocols = ['http', 'https'];

const parseUrl = (urlString) => {
    try {
        url = new URL(urlString);
        return protocols.map(protocol => `${protocol.toLowerCase()}:`).includes(url.protocol) ? url : null;
    } catch (err) {
        return null;
    }
};

module.exports = { parseUrl }
