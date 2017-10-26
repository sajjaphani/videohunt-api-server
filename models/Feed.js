var mongoose = require('mongoose');
const { QUERY_BY_DATE_RANGE, QUERY_BY_DATE_FORWARD, QUERY_BY_DATE_BACKWARD } = require('./constants')
const { getFeedPagination } = require('./PaginationHelper')
const { getFeedQueryObject } = require('./QueryObjectHelper')

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var FeedSchema = new Schema({
    'date': {
        type: Date,
        required: true,
        unique: true
    }, // a day (not time stamp included) (Sample: 2017-7-14, YYYY-MM-DD)
    'posts': [ObjectId] // posts on a date
});

FeedSchema.statics.getFeedsPromise = function (query, user, models) {
    // Do we need to pass the feed parameter?
    let feedQueryObj = getFeedQueryObject(query, 'date')
    return this.find(feedQueryObj).sort({ 'date': -1 }).limit(query.limit + 1).exec().then(function (feeds) {
        let postIds = []
        let feedsObj = {}
        let pagination = getFeedPagination(query, feeds, 'date', query.pagingRelativePath)
        feeds.forEach(function (feed) {
            feedsObj[feed.date.toISOString()] = feed.posts
            postIds = postIds.concat(feed.posts)
        })
        return models.Post.getPostsPromise(postIds, query, user, models).then(function (feed) {
            if (query.feedSummary)
                feed.feed = feedsObj
            let feedObj = { data: feed }
            if (Object.keys(pagination).length !== 0) {
                feedObj.pagination = pagination
            }
            return feedObj
        })
    })
}

// Category based feed end point
FeedSchema.statics.getCategoryFeedPromise = function (query, user, models) {
    let feedQueryObj = getFeedQueryObject(query, 'postedOn')
    feedQueryObj.category = query.category
    if (query.language != 'all')
        feedQueryObj.language = query.language
    return models.Post.find(feedQueryObj).sort({ 'postedOn': -1 }).limit(query.limit + 1).exec().then(function (posts) {
        let postIds = []
        posts.forEach(function (post) {
            postIds.push(post.id)
        })
        let pagination = getFeedPagination(query, posts, 'postedOn', query.pagingRelativePath)
        return models.Post.getPostsWrapperPromise(posts, query, user, models).then(function (feed) {
            feed.feed = { postIds: postIds }
            let categoryFeed = { data: feed }
            if (Object.keys(pagination).length !== 0) {
                categoryFeed.pagination = pagination
            }
            return categoryFeed
        })
    })
}

module.exports = FeedSchema