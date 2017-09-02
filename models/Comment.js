var mongoose = require('mongoose');

const { getLikeData, getCommentData } = require('./ModelHelper')

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
    'content': String, // comments of the post
    'userId': ObjectId, // User who commented
    'likes': [ObjectId], // users who liked
    'comments': [ObjectId], // list of comments on this
    'commentedOn': {
        type: Date,
        default: Date.now
    }
});

// Add or remove the user from like data (toggle like)
CommentSchema.statics.updateLikePromise = function (commentId, userId, liked, callback) {
    let options = { safe: true, new: true }
    let updateObj = liked ? { $addToSet: { likes: userId } } : { $pull: { likes: userId } }
    return this.findByIdAndUpdate(commentId, updateObj, options).exec().then(function (comment) {
        return { liked: liked, userId: userId, commentId: comment._id }
    })
}

// Given commentIds get the comments data
CommentSchema.statics.getCommentsPromise = function (commentIds, user) {
    let queryObj = {
        '_id': {
            $in: commentIds
        }
    }
    return this.find(queryObj).exec().then(function(comments) {
        var userIds = []
        var userIdStrings = []
        let commentsFeed = comments.reduce(function (comments, comment) {
            let commentObj = comment.toJSON()
            commentObj.likes = getLikeData(comment.likes, user)
            commentObj.replies = getCommentData(comment.comments, user)
            delete commentObj.comments
    
            comments[comment._id] = commentObj
            if (userIdStrings.indexOf(comment.userId.toString()) === -1) {
              userIdStrings.push(comment.userId.toString())
              userIds.push(comment.userId)
            }
            return comments;
          }, {});
          return { comments: commentsFeed, users: userIds }
    })
}

// Given a top level commentId, it fetches the replies to that comment
CommentSchema.statics.getRepliesPromise = function (commentId, user, models) {
    return this.findById(commentId).exec().then(function (comment) {
        return models.Comment.getCommentsPromise(comment.comments, user).then(function (feed) {
            return feed.comments;
        })
    })
}

// Add a reply to an existing comment
CommentSchema.statics.addReplyPromise = function (commentId, replyText, user, models) {
    let newComment = {
        content: replyText,
        userId: user.id
    }
    return this.findById(commentId).exec().then(function (comment) {
        return new models.Comment(newComment).save()
    }).then(function (comment) {
        let updateObj = { $push: { comments: comment._id } }
        let options = { safe: true, upsert: true, new: true }
        return models.Comment.findByIdAndUpdate(commentId, updateObj, options).exec().then(function (updatedComment) {
            newComment.commentId = comment._id
            newComment.parentId = commentId
            newComment.commentedOn = comment.commentedOn
            newComment.likes = getLikeData([], user)
            newComment.replies = getCommentData([], user)

            return newComment
        })
    })
}

module.exports = CommentSchema