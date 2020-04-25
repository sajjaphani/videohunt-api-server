const { FEED_POSTS_LIMIT, TOPIC_POSTS_LIMIT, POST_COMMENTS_LIMIT, COMMENT_REPLIES_LIMIT } = require('./constants')
const { API_BASE } = require('../../routes/constants');

function getNextPage(query) {
    console.log(query)
    const page = query.page || 1;
    if (page > 1) {
        return +page + 1;
    }

    return 2;
}

function getFeedPostsNextPage(page, limit) {
    const nextPageUrl = `${API_BASE}posts?page=${page}&limit=${limit}`
    return nextPageUrl
}

function getFeedPostsPaging(query, count) {
    const paging = {};
    const limit = query.limit || FEED_POSTS_LIMIT;
    if (limit === count) {
        const page = getNextPage(query);
        paging.next = getFeedPostsNextPage(page, limit);
    }

    return paging;
}

function getTopicPostsNextPage(category, page, limit) {
    const nextPageUrl = `${API_BASE}category/${category}?page=${page}&limit=${limit}`
    return nextPageUrl
}

function getTopicPostsPaging(query, count) {
    const paging = {};
    const limit = query.limit || TOPIC_POSTS_LIMIT;
    if (limit === count) {
        const page = getNextPage(query);
        paging.next = getTopicPostsNextPage(query.category, page, limit);
    }

    return paging;
}

function getPostCommentsNextPage(postId, page, limit) {
    const nextPageUrl = `${API_BASE}posts/${postId}/comments?page=${page}&limit=${limit}`
    return nextPageUrl
}

function getPostCommentsPaging(query, count) {
    const paging = {};
    const limit = query.limit || POST_COMMENTS_LIMIT;
    if (limit === count) {
        const page = getNextPage(query);
        paging.next = getPostCommentsNextPage(query.postId, page, limit);
    }

    return paging;
}

function getCommentRepliesNextPage(commentId, page, limit) {
    const nextPageUrl = `${API_BASE}comments/${commentId}/comments?page=${page}&limit=${limit}`
    return nextPageUrl
}

function getCommentRepliesPaging(query, count) {
    const paging = {};
    const limit = query.limit || COMMENT_REPLIES_LIMIT;
    if (limit === count) {
        const page = getNextPage(query);
        paging.next = getCommentRepliesNextPage(query.commentId, page, limit);
    }

    return paging;
}

module.exports = {
    getFeedPostsPaging, getTopicPostsPaging, getPostCommentsPaging, getCommentRepliesPaging
}