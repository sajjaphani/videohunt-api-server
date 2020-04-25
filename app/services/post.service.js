var mongoose = require('mongoose');

var Post = mongoose.model('Post');
var VideoEmbed = mongoose.model('VideoEmbed');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');

const { getLikeData, getCommentData } = require('../models/helpers/ModelHelper');
const { getPostCommentsPaging } = require('../models/helpers/PaginationHelper')

const { API_BASE } = require('../routes/constants')
const { getEmbedUrl, fetchOEmbed } = require('./embed.service');

function getPosts(postId, query, user) {
    return Post.getPosts(postId, query)
        .then((posts) => {
            var userIds = [];
            var userIdStrings = [];
            var commentIds = [];
            var postFeed = posts.reduce((postsObj, post) => {
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
                .then((userFeed) => {
                    return { posts: postFeed, users: userFeed };
                })
        });
}

function checkNewPost(url, user) {
    return getEmbedUrl(url)
        .then(() => {
            return Post.findPostByUrl(url)
        })
        .then((post) => {
            if (post) {
                const validationError = {
                    status: 'error',
                    error: {
                        type: "DuplicatePost",
                        message: "There is a post that exists for the given URL!",
                        code: 200101,
                        errorData: post
                    }
                };
                return Promise.reject(validationError);
            } else {
                return VideoEmbed.findVideoByUrl(url)
            }
        })
        .then((embedVideo) => {
            if (embedVideo) {
                return embedVideo;
            } else {
                return fetchOEmbed(url)
                    .then(embed => {
                        embed.url = url;
                        embed.embed = embed.html;
                        return embed;
                    }).then((data) => {
                        data.userId = user.id;
                        return VideoEmbed.addVideoEmbedPromise(data)
                    });
            }
        })
        .then((embed) => {
            return { status: 'ok', data: embed };
        })
        .catch((error) => {
            console.log('err', error)
            return error;
        });
}

function saveNewPost(postData, user) {
    return VideoEmbed.findVideoByUrl(postData.url)
        .then((embedVideo) => {
            if (!embedVideo)
                return { status: 'error', data: { error: 'err.error', message: 'err.message' } };
            else {
                embedVideo.title = postData.title;
                embedVideo.description = postData.description;
                embedVideo.categories = postData.categories;
                embedVideo.language = postData.language;
                return Post.addPost(embedVideo, user).then((post) => {
                    let postObj = {
                        url: post.url, title: post.title,
                        author: post.author, author_url: post.author_url, provider_name: post.provider_name,
                        description: post.description, thumbnail_url: post.thumbnail_url,
                        thumbnail_width: post.thumbnail_width, thumbnail_height: post.thumbnail_height,
                        embed: post.embed, userId: post.userId, language: post.language, postedOn: post.postedOn
                    };

                    postObj.id = post._id;
                    postObj.likes = getLikeData([], user)
                    postObj.comments = getCommentData([], user, null)

                    return { feedKey: new Date(), post: postObj };
                }).then(embedData => {
                    return VideoEmbed.findByIdAndRemove(embedVideo._id).exec()
                        .then(() => {
                            return embedData;
                        }).catch(() => {
                            return embedData;
                        });
                });
            }
        });
}

function updateLike(postId, userId, liked) {
    return Post.updateLike(postId, userId, liked)
}

function addComment(postId, content, user) {
    return Comment.add(content, user.id)
        .then((comment) => {
            let updateObj = { $push: { comments: comment._id } }
            let options = { safe: true, upsert: true, new: true };
            return Post.findAndUpdate(postId, updateObj, options)
                .then((post) => {
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
        .then((post) => {
            return Comment.getCommentsPromise(post.comments, query, user)
                .then((comments) => {
                    query.postId = postId;
                    let pagination = getPostCommentsPaging(query, comments.length);
                    var userIds = []
                    var userIdStrings = []
                    let commentsFeed = comments.reduce(function (comments, comment) {
                        let commentObj = comment.toJSON()
                        commentObj.likes = getLikeData(comment.likes, user)
                        let commentPage = API_BASE + 'comments/' + comment.id + '/comments'
                        commentObj.replies = getCommentData(comment.comments, user, commentPage)
                        delete commentObj.comments

                        comments[comment._id] = commentObj
                        if (userIdStrings.indexOf(comment.userId.toString()) === -1) {
                            userIdStrings.push(comment.userId.toString())
                            userIds.push(comment.userId)
                        }
                        return comments;
                    }, {});
                    let feed = { data: { comments: commentsFeed } }
                    if (Object.keys(pagination).length !== 0)
                        feed.pagination = pagination;
                    return User.getUserFeedPromise(userIds)
                        .then((userFeed) => {
                            feed.data.users = userFeed
                            return feed
                        })
                });
        });
}

function searchPosts(searchStr, user) {
    return Post.findPosts(searchStr)
        .then((posts) => {
            const _posts = posts.map(post => {
                return {
                    id: post._id,
                    title: post.title,
                    description: post.description,
                    image: post.thumbnail_url
                }
            });

            return _posts;
        });
}

module.exports = {
    checkNewPost, saveNewPost, getPosts,
    updateLike, addComment, getComments,
    searchPosts
};
