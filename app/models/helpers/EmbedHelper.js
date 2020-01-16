const axios = require('axios');

const embedUrlBase = 'http://open.iframe.ly/api/oembed'

function getEmbedData(url) {
    const embedGetUri = embedUrlBase + '?url=' + url + '&origin=experiment';
    return axios.get(embedGetUri)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            return error;
        });
}

module.exports = {
    getEmbedData
}