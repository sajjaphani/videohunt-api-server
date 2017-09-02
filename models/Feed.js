var mongoose = require('mongoose');
const { QUERY_BY_DATE_RANGE, QUERY_BY_DATE_FORWARD, QUERY_BY_DATE_BACKWARD } = require('./constants')
const { getFeedPagination } = require('./PaginationHelper')

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

const POST_GET_BASE = 'http://localhost:3000/api/v1/posts'

function getFeedQueryObject(query, fieldName) {
    let queryObj = {}
    
    if (query.query == QUERY_BY_DATE_RANGE) {
        // Range query, (E.g, give me feeds for range, from(since) -> to(until)
        queryObj[fieldName] = { "$gte": query.since, "$lte": query.until }
    } else if (query.query == QUERY_BY_DATE_BACKWARD) {
        // Backward query, (E.g, give me 3 feeds, ends at until
        queryObj[fieldName] = { "$lte": query.until }
    } else if (query.query == QUERY_BY_DATE_FORWARD) {
        // Forward query, (E.g, give me 3 feeds, starts at since
        queryObj[fieldName] = { "$gte": query.since }
    } else {
        // This is the 'default' query, (E.g, start at current date and get 3 feeds)
        queryObj[fieldName] = { "$lte": query.since }
    }

    return queryObj
}

FeedSchema.statics.getFeedsPromise = function (query, user, models) {
    // Do we need to pass the feed parameter?
    let feedQueryObj = getFeedQueryObject(query, 'date')
    console.log(feedQueryObj)
    return this.find(feedQueryObj).sort({ 'date': -1 }).limit(query.limit + 1).exec().then(function (feeds) {
        let postIds = []
        let feedsObj = {}
        let pagination = getFeedPagination(query, feeds, 'date', 'posts')
        feeds.forEach(function (feed) {
            feedsObj[feed.date.toISOString()] = feed.posts
            postIds = postIds.concat(feed.posts)
        })
        return models.Post.getPostsPromise(postIds, user, models).then(function (feed) {
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
        let pagination = getFeedPagination(query, posts, 'postedOn', 'category/' + query.category)
        return models.Post.getPostsWrapperPromise(posts, user, models).then(function (feed) {
            if (Object.keys(pagination).length !== 0) {
                feed.pagination = pagination
            }
           return feed
        })
    })
}

module.exports = FeedSchema