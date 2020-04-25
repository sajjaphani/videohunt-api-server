var mongoose = require('mongoose');

var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

const { getLikeData, getCommentData } = require('../models/helpers/ModelHelper')
const { getCommentRepliesPaging } = require('../models/helpers/PaginationHelper')

const { API_BASE } = require('../routes/constants')

function updateLike(commentId, userId, liked) {
    return Comment.updateLike(commentId, userId, liked)
}

function getReplies(commentId, query, user) {
    return Comment.findById(commentId).exec()
        .then((comment) => {
            return Comment.getCommentsPromise(comment.comments, query, user)
                .then((comments) => {
                    query.commentId = commentId;
                    let pagination = getCommentRepliesPaging(query, comments.length);
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
                }).catch(err => console.log(err));
        });
}

function addReply(commentId, replyText, mention, user) {
    return Comment.add(replyText, user.id, mention)
        .then((comment) => {
            let updateObj = { $push: { comments: comment._id } }
            let options = { safe: true, upsert: true, new: true }
            return Comment.findByIdAndUpdate(commentId, updateObj, options).exec()
                .then((cmnt) => {
                    let newComment = {
                        content: replyText,
                        userId: user.id
                    }
                    newComment.commentId = comment._id
                    newComment.parentId = commentId
                    newComment.commentedOn = comment.commentedOn
                    newComment.likes = getLikeData([], user)
                    newComment.replies = getCommentData([], user, null)

                    return newComment
                });
        });
}

module.exports = {
    updateLike, getReplies, addReply
};