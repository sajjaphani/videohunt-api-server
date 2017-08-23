var mongoose = require('mongoose');
const { QUERY_BY_DATE_RANGE, QUERY_BY_DATE_FORWARD, QUERY_BY_DATE_BACKWARD } = require('../models/constants')

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

FeedSchema.statics.findFeeds = function (query, callback) {
    // TODO we further need to check the data size, data can be empty, we should supress pagination
    // For range query we don't need to form the feed
    // Do we need to pass the feed parameter?
    if (query.query == QUERY_BY_DATE_RANGE) {
        // Range query, (E.g, give me feeds for range, from(since) -> to(until)
        return this.find({ "date": { "$gte": query.since, "$lte": query.until } }, function (err, data) {
            // No pagination
             callback(err, { data: data})
        }).sort({ 'date': -1 }).limit(query.limit);
    } else if (query.query == QUERY_BY_DATE_BACKWARD) {
        // Backward query, (E.g, give me 3 feeds, ends at until
        return this.find({ "date": { "$lte": query.until } }, function (err, data) {
            // We have next page here we have to use 'until' here
            let pagination = {}
            pagination.previous = POST_GET_BASE + '?limit=' + query.limit + "&since=" + data[0].date.getTime()
            if (data.length == query.limit + 1) {
                let lastFeed = data.pop()
                pagination.next = POST_GET_BASE + '?limit=' + query.limit + "&until=" + lastFeed.date.getTime()
            }
            callback(err, { data: data, pagination: pagination })
        }).sort({ 'date': -1 }).limit(query.limit + 1);
        
    } else if (query.query == QUERY_BY_DATE_FORWARD) {
        // Forward
        // Forward query, (E.g, give me 3 feeds, starts at since
        return this.find({ "date": { "$gte": query.since } }, function (err, data) {
            // We have prev page here
            let pagination = {}
            pagination.next = POST_GET_BASE + '?limit=' + query.limit + "&until=" + data[0].date.getTime()
            if (data.length == query.limit + 1) {
                let lastFeed = data.pop()
                pagination.previous = POST_GET_BASE + '?limit=' + query.limit + "&since=" + lastFeed.date.getTime()
            }
            callback(err, { data: data, pagination: pagination })
        }).sort({ 'date': -1 }).limit(query.limit + 1);
    } else {
        // This is the 'default' query, (E.g, start at current date and get 3 feeds)
        return this.find({ "date": { "$lte": query.since } }, function (err, data) {
            // We have prev page here
            let pagination = {}
            if (data.length == query.limit + 1) {
                let lastFeed = data.pop()
                pagination.next = POST_GET_BASE + '?limit=' + query.limit + "&until=" + lastFeed.date.getTime()
                callback(err, { data: data, pagination: pagination })
            } else {
                // No pagination, unlikely we hit this
                callback(err, { data: data })
            }
        }).sort({ 'date': -1 }).limit(query.limit + 1);
    }
}

module.exports = FeedSchema