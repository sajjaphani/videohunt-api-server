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
CommentSchema.statics.getCommentsPromise = function (commentIds, query, user, models) {
    let feedQueryObj = getFeedQueryObject(query, 'commentedOn')
    feedQueryObj['_id'] = {
        $in: commentIds
    }
    return this.find(feedQueryObj).sort({ 'commentedOn': -1 }).limit(query.limit + 1).exec().then(function (comments) {
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
    }).then(function (feed) {
        return User.getUserFeedPromise(feed.data.users).then(function (userFeed) {
            feed.data.users = userFeed
            return feed
        })
    })
}

// Given a top level commentId, it fetches the replies to that comment
CommentSchema.statics.getRepliesPromise = function (commentId, query, user, models) {
    return this.findById(commentId).exec().then(function (comment) {
        return this.model.getCommentsPromise(comment.comments, query, user, models).then(function (feed) {
            return feed;
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
        return new this(newComment).save();
    }).then(function (comment) {
        let updateObj = { $push: { comments: comment._id } }
        let options = { safe: true, upsert: true, new: true }
        return Comment.findByIdAndUpdate(commentId, updateObj, options).exec().then(function (updatedComment) {
            newComment.commentId = comment._id
            newComment.parentId = commentId
            newComment.commentedOn = comment.commentedOn
            newComment.likes = getLikeData([], user)
            newComment.replies = getCommentData([], user, null)

            return newComment
        })
    })
}

mongoose.model('Comment', CommentSchema);
