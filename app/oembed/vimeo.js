const OEmbed = require('./embed-base');

const data = {
    providerName: 'Vimeo', providerUrl: 'https://vimeo.com', apiUrl: 'https://vimeo.com/api/oembed.json'
};

const Vimeo = function () {
    OEmbed.call(this, data.providerName, data.providerUrl, data.apiUrl);
}

Vimeo.prototype = Object.create(OEmbed.prototype);

module.exports = Vimeo;