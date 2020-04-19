const OEmbed = require('./embed-base');

const data = {
    providerName: 'Facebook', providerUrl: 'https://www.facebook.com', apiUrl: 'https://www.facebook.com/plugins/video/oembed.json/'
};

const Facebook = function () {
    OEmbed.call(this, data.providerName, data.providerUrl, data.apiUrl);
}

Facebook.prototype = Object.create(OEmbed.prototype);
Facebook.prototype.getRequestUrl = function (url) {
    return `${this.apiUrl}?url=${url}&omitscript=true`;
};

module.exports = Facebook;