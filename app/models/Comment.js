var mongoose = require('mongoose');

const { getLikeData, getCommentData } = require('./helpers/ModelHelper')
const { getFeedQueryObject } = require('./helpers/QueryObjectHelper')
const { getFeedPagination } = require('./helpers/PaginationHelper')

const { API_BASE } = require('../routes/constants')

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
    let feedQueryObj = getFeedQueryObject(query, 'commentedOn');
    feedQueryObj['_id'] = {
        $in: commentIds
    }
    return this.find(feedQueryObj).sort({ 'commentedOn': -1 }).limit(query.limit + 1).exec()
        .then(function (comments) {
            let pagination = getFeedPagination(query, comments, 'commentedOn', query.pagingRelativePath)
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
            let feed = { data: { comments: commentsFeed, users: userIds } }
            if (Object.keys(pagination).length !== 0)
                feed.pagination = pagination

            return feed
        });
}

CommentSchema.statics.add = function (comment, userId, mention) {
    let newComment = {
        content: comment,
        userId: userId
    };
    if(mention) {
        newComment.mention = mention;
    }
    return new this(newComment).save();
}

mongoose.model('Comment', CommentSchema);
