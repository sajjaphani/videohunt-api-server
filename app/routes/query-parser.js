const { FEED_POSTS_LIMIT, TOPIC_POSTS_LIMIT,
    POST_COMMENTS_LIMIT, COMMENT_REPLIES_LIMIT } = require('../models/helpers/constants');

function getQueryObject(page, limit) {
    console.log(page, limit)
    const skip = (page - 1) * limit;
    const queryObject = { page: page, skip: skip, limit: limit };
    return queryObject;
}

function getCurrentPage(query) {
    const page = query.page || 1;
    if (page >= 1) {
        return page;
    }

    return 1;
}

function withFeedSummary(queryObject, query) {
    let feedSummary = query.feed_summary || 'true';
    queryObject.feedSummary = feedSummary === 'true';
    queryObject.language = query.language || 'all';

    return queryObject;
}

function getFeedPostsQueryObject(query) {
    const page = getCurrentPage(query)
    const queryObject = getQueryObject(page, FEED_POSTS_LIMIT);
    const withSummary = withCommentsSummary(queryObject, query);
    return withFeedSummary(withSummary, query);
}

function getTopicPostsQueryObject(query) {
    const page = getCurrentPage(query)
    const queryObject = getQueryObject(page, TOPIC_POSTS_LIMIT);
    const withSummary = withCommentsSummary(queryObject, query);
    return withFeedSummary(withSummary, query);
}

function withCommentsSummary(queryObject, query) {
    let commentsSummary = query.comments_summary || 'true';
    let likesSummary = query.likes_summary || 'true';
    queryObject.commentsSummary = commentsSummary === 'true';
    queryObject.likesSummary = likesSummary === 'true';

    return queryObject;
}

function getPostCommentsQueryObject(query) {
    const page = getCurrentPage(query)
    const queryObject = getQueryObject(page, POST_COMMENTS_LIMIT);
    return withCommentsSummary(queryObject, query);
}

function getCommentRepliesQueryObject(query) {
    const page = getCurrentPage(query);
    const queryObject = getQueryObject(page, COMMENT_REPLIES_LIMIT);
    return withCommentsSummary(queryObject, query);
}

module.exports = {
    getFeedPostsQueryObject, getTopicPostsQueryObject,
    getPostCommentsQueryObject, getCommentRepliesQueryObject
};