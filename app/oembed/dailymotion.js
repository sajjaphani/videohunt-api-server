const OEmbed = require('./embed-base');

const data = {
    providerName: 'Dailymotion', providerUrl: 'https://www.dailymotion.com', apiUrl: 'https://www.dailymotion.com/services/oembed'
};

const Dailymotion = function () {
    OEmbed.call(this, data.providerName, data.providerUrl, data.apiUrl);
}

Dailymotion.prototype = Object.create(OEmbed.prototype);

module.exports = Dailymotion;