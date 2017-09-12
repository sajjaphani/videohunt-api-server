var Promise = require('bluebird')

const { getEmbedData } = require('./EmbedHelper')

function checkNewPost(url, user, models) {
    return new Promise(function (resolve, reject) {
        models.Post.findPostByUrl(url).then(function (post) {
            if (post)
                resolve({ status: 'duplicate', data: post })
            else {
                models.VideoEmbed.findVideoByUrl(url).then(function (embedVideo) {
                    if (embedVideo)
                        resolve({ status: 'submitted', data: embedVideo })
                    else {
                        getEmbedData(url).then(function (data) {
                            models.VideoEmbed.addVideoEmbedPromise(data, user, models).then(function (embed) {
                                resolve({ status: 'ok', data: embed })
                            })
                        }).catch(function (err) {
                            return reject(err)
                        })
                    }
                })
            }
        })
    })
}

function saveNewPost(postData, user, models) {
    return new Promise(function (resolve, reject) {
        models.VideoEmbed.findVideoByUrl(postData.url).then(function (embedVideo) {
            if (!embedVideo)
                reject({ status: 'error', data: { error: 'err.error', message: 'err.message' } })
            else {
                embedVideo.category = postData.category,
                embedVideo.language = postData.language,
                models.Post.addPostPromise(embedVideo, user, models).then(function (response) {
                    resolve(response)
                }).then(undefined, function (err) {
                    reject(err)
                })
            }
        })
    })
}

module.exports = {
    checkNewPost, saveNewPost
}