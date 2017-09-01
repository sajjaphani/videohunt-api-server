var mongoose = require('mongoose');

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

CommentSchema.statics.getCommentsPromise = function (commentIds) {
    let queryObj = {
        '_id': {
            $in: commentIds
        }
    }
    return this.find(queryObj).exec()
}

module.exports = CommentSchema