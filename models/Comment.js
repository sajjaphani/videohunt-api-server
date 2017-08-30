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
CommentSchema.statics.updateLike = function (commentId, userId, liked, callback) {
    let options = { safe: true, new: true }
    let updateObj = liked ? { $addToSet: { likes: userId } } : { $pull: { likes: userId } }
    this.findByIdAndUpdate(commentId, updateObj, options, function (err, comment) {
        callback(err, comment)
    })
}

module.exports = CommentSchema