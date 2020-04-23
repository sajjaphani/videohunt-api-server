var mongoose = require('mongoose');

var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

const { getLikeData, getCommentData } = require('../models/helpers/ModelHelper')

function updateLike(commentId, userId, liked) {
    return Comment.updateLike(commentId, userId, liked)
}

function getReplies(commentId, query, user) {
    return Comment.findById(commentId).exec()
        .then((comment) => {
            return Comment.getCommentsPromise(comment.comments, query, user)
                .then((feed) => {
                    return User.getUserFeedPromise(feed.data.users)
                        .then((userFeed) => {
                            feed.data.users = userFeed
                            return feed
                        })
                })
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