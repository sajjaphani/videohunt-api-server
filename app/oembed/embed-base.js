function OEmbed(providerName, providerUrl, apiUrl) {
    this.providerName = providerName;
    this.providerUrl = providerUrl;
    this.apiUrl = apiUrl;
}

OEmbed.prototype.getRequestUrl = function (url) {
    const reqUrl = `http://open.iframe.ly/api/oembed?url=${url}&origin=experiment`;
    return reqUrl;
};

module.exports = OEmbed;
