var mongoose = require('mongoose');

var Post = mongoose.model('Post');
var VideoEmbed = mongoose.model('VideoEmbed');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');

const { updateFeed } = require('./feed.service');
const { getEmbedData } = require('../models/helpers/EmbedHelper')
const { getLikeData, getCommentData } = require('../models/helpers/ModelHelper')
const { API_BASE } = require('../routes/constants')

function checkNewPost(url, user) {
    return Post.findPostByUrl(url).then(function (post) {
        if (post) {
            return { status: 'duplicate', data: post };
        } else {
            return VideoEmbed.findVideoByUrl(url).then(function (embedVideo) {
                if (embedVideo)
                    return { status: 'submitted', data: embedVideo };
                else {
                    return getEmbedData(url).then(function (data) {
                        data.userId = user.id;
                        return VideoEmbed.addVideoEmbedPromise(data)
                            .then(function (embed) {
                                return { status: 'ok', data: embed };
                            });
                    });
                }
            });
        }
    });
}

function saveNewPost(postData, user) {
    return VideoEmbed.findVideoByUrl(postData.url)
        .then(function (embedVideo) {
            if (!embedVideo)
                return { status: 'error', data: { error: 'err.error', message: 'err.message' } };
            else {
                embedVideo.title = postData.title;
                embedVideo.description = postData.description;
                embedVideo.category = postData.category;
                embedVideo.language = postData.language;
                return Post.addPost(embedVideo, user).then(function (post) {
                    let date = new Date(post.postedOn.getTime());
                    // We want date part only (set to its midnight)
                    date.setHours(12, 0, 0, 0);
                    const query = { date: date };
                    const update = { $push: { posts: post._id } };

                    // Find the feed document and update
                    return updateFeed(query, update).then(function (feedObj) {
                        let postObj = { ...post };
                        delete postObj._id;
                        postObj.id = post._id;
                        postObj.likes = getLikeData([], user)
                        postObj.comments = getCommentData([], user, null)

                        return { feedKey: date, post: postObj };
                    });
                });
            }
        });
}

function getPosts(postId, query, user) {
    return Post.getPosts(postId, query)
        .then(function (posts) {
            var userIds = [];
            var userIdStrings = [];
            var commentIds = [];
            var postFeed = posts.reduce(function (postsObj, post) {
                let postObj = post.toJSON()
                postObj.likes = getLikeData(post.likes, user)
                let commentPage = API_BASE + 'posts/' + post.id + '/comments'
                postObj.comments = getCommentData(post.comments, user, commentPage);
                postsObj[post._id] = postObj;
                commentIds = commentIds.concat(post.comments)
                if (userIdStrings.indexOf(post.userId.toString()) === -1) {
                    userIdStrings.push(post.userId.toString());
                    userIds.push(post.userId);
                }

                return postsObj
            }, {});

            return User.getUserFeedPromise(userIds)
                .then(function (userFeed) {
                    return { posts: postFeed, users: userFeed };
                })
        });
}

function updateLike(postId, userId, liked) {
    return Post.updateLike(postId, userId, liked)
}

function addComment(postId, content, user) {
    return Comment.add(content, user.id)
        .then(function (comment) {
            let updateObj = { $push: { comments: comment._id } }
            let options = { safe: true, upsert: true, new: true };
            return Post.findAndUpdate(postId, updateObj, options)
                .then(function (post) {
                    let newComment = {
                        content: content,
                        userId: user.id
                    };
                    newComment.postId = post.id
                    newComment.commentId = comment._id;
                    newComment.commentedOn = comment.commentedOn;
                    newComment.likes = getLikeData([], user);
                    newComment.replies = getCommentData([], user, null);

                    return newComment;
                });
        });
}

function getComments(postId, query, user) {
    return Post.findPostById(postId)
        .then(function (post) {
            return Comment.getCommentsPromise(post.comments, query, user)
                .then(function (feed) {
                    return User.getUserFeedPromise(feed.data.users)
                        .then(function (userFeed) {
                            feed.data.users = userFeed
                            return feed
                        })
                })
        });
}

module.exports = {
    checkNewPost, saveNewPost, getPosts, updateLike, addComment, getComments
};
