const OEmbed = require('./embed-base');
const { get } = require('../util/http-util')

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

Facebook.prototype.getOEmbed = function (url) {
    const requestUrl = this.getRequestUrl(url);
    return get(requestUrl).then((data) => {
        data.author = getAuthor(data.html);
        data.url = getUrl(data.html, data.url);
        data.title = getTitle(data.html);
        data.description = getDescription(data.html);
        return data;
    });
};

module.exports = Facebook;

// TODO we need to replace the regex
function getTitle(embed) {
    const match = embed.match(/<a [^>]+>([^<]+)<\/a>/);
    if (match) {
        return match[1];
    }

    return ''
}

function getDescription(embed) {
    const match = embed.match(/<p>([^<]+)<\/p>/);
    if (match) {
        return match[1];
    }

    return '';
}

function getUrl(embed, url) {
    const match = embed.match(/<a href="(.*?)"/);
    if (match) {
        return match[1];
    }

    return url;
}

function getAuthor(embed) {
    const matches = embed.match(/<a.*>([^<]+)<\/a>/g);
    if (matches && matches.length === 2) {
        const match = matches[1].match(/<a.*>([^<]+)<\/a>/);
        if (match) {
            return match[1];
        }
    }

    return '';
}