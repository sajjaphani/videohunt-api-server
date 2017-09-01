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
CommentSchema.statics.getCommentsPromise = function (commentIds) {
    let queryObj = {
        '_id': {
            $in: commentIds
        }
    }
    return this.find(queryObj).exec()
}

// Given a top level commentId, it fetches the replies to that comment
CommentSchema.statics.getRepliesPromise = function (commentId, user, models) {
    return this.findById(commentId).exec().then(function(comment) {
        return models.Comment.getCommentsPromise(comment.comments).then(function(comments){
            var commentsFeed = comments.reduce(function (comments, comment) {
                let commentObj = comment.toJSON()
                commentObj.likes = getLikeData(comment.likes, user)
                commentObj.replies = getCommentData(comment.comments, user)
                delete commentObj.comments
                comments[comment._id] = commentObj
                return comments;
            }, {});
            return commentsFeed;
        })
    })
}

module.exports = CommentSchema