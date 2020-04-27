const { get } = require('../util/http-util')

function OEmbed(providerName, providerUrl, apiUrl) {
    this.providerName = providerName;
    this.providerUrl = providerUrl;
    this.apiUrl = apiUrl;
}

OEmbed.prototype.getRequestUrl = function (url) {
    const reqUrl = `http://open.iframe.ly/api/oembed?url=${url}&origin=experiment`;
    return reqUrl;
};

OEmbed.prototype.getOEmbed = function (url) {
    const reqUrl = this.getRequestUrl(url);
    return get(reqUrl);
};

module.exports = OEmbed;
