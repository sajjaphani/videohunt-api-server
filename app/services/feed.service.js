var mongoose = require('mongoose');

var Feed = mongoose.model('Feed');

function getFeed(query, user) {
    return Feed.getFeedsPromise(query, user);
}

function getCategoryFeed(query, user) {
    return Feed.getCategoryFeedPromise(query, user);
}

module.exports = {
    getFeed, getCategoryFeed
};
