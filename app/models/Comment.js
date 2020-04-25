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
    },
    'mention': {
        type: ObjectId,
        required: false
    }
});

// Add or remove the user from like data (toggle like)
CommentSchema.statics.updateLike = function (commentId, userId, liked) {
    let options = { safe: true, new: true }
    let updateObj = liked ? { $addToSet: { likes: userId } } : { $pull: { likes: userId } }
    return this.findByIdAndUpdate(commentId, updateObj, options).exec()
        .then(function (comment) {
            return { liked: liked, userId: userId, commentId: comment._id }
        })
}

// Given commentIds get the comments data
CommentSchema.statics.getCommentsPromise = function (commentIds, query, user) {
    let feedQueryObj = {};
    feedQueryObj['_id'] = { $in: commentIds };
    const skip = query.skip || 0;
    const limit = query.limit || 1;
    return this.find(feedQueryObj).skip(skip).limit(limit).exec();
}

CommentSchema.statics.add = function (comment, userId, mention) {
    let newComment = {
        content: comment,
        userId: userId
    };
    if (mention) {
        newComment.mention = mention;
    }
    return new this(newComment).save();
}

mongoose.model('Comment', CommentSchema);
