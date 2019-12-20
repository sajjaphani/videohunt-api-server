var Promise = require('bluebird')
var rp = require('request-promise')

const embedUrlBase = 'http://open.iframe.ly/api/oembed'

function getEmbedData(url) {
    const embedGetUri = embedUrlBase + '?url=' + url + '&origin=experiment'
    // console.log('End point', embedGetUri)
    return new Promise(function (resolve, reject) {
        rp(embedGetUri)
            .then(function (result) {
                return resolve(JSON.parse(result))
            })
            .catch(function (err) {
                return reject(err)
            });
    })
}

module.exports = {
    getEmbedData
}