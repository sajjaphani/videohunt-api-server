const OEmbed = require('./embed-base');

const data = {
    providerName: 'YouTube', providerUrl: 'https://www.youtube.com', apiUrl: 'https://www.youtube.com/oembed'
};

const YouTube = function () {
    OEmbed.call(this, data.providerName, data.providerUrl, data.apiUrl);
}

YouTube.prototype = Object.create(OEmbed.prototype);

module.exports = YouTube;