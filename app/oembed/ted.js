const OEmbed = require('./embed-base');

const data = {
    providerName: 'TED', providerUrl: 'https://www.ted.com', apiUrl: 'https://www.ted.com/services/v1/oembed.json'
};

const Ted = function () {
    OEmbed.call(this, data.providerName, data.providerUrl, data.apiUrl);
}

Ted.prototype = Object.create(OEmbed.prototype);

module.exports = Ted;