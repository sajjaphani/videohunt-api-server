var mongoose = require('mongoose');

var Feed = mongoose.model('Feed');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var FeedCategory = mongoose.model('FeedCategory');

const { getFeedPagination } = require('../models/helpers/PaginationHelper')
const { getFeedQueryObject } = require('../models/helpers/QueryObjectHelper')
const { getLikeData, getCommentData } = require('../models/helpers/ModelHelper')
const { API_BASE } = require('../routes/constants');

function getFeed(query, user) {
    return Feed.getFeed(query, user)
        .then((feeds) => {
            let postIds = [];
            let feedsObj = {};
            let pagination = getFeedPagination(query, feeds, 'date', query.pagingRelativePath)
            feeds.forEach((feed) => {
                const posts = feed.posts.reverse();
                feedsObj[feed.date.toISOString()] = posts;
                postIds = postIds.concat(posts);
            });
            return Post.getPosts(postIds, query)
                .then((posts) => {
                    var userIds = [];
                    var userIdStrings = [];
                    var commentIds = [];
                    var postFeed = posts.reduce((postsObj, post) => {
                        let postObj = post.toJSON()
                        postObj.likes = getLikeData(post.likes, user)
                        let commentPage = API_BASE + 'posts/' + post.id + '/comments'
                        postObj.comments = getCommentData(post.comments, user, commentPage);
                        postsObj[post._id] = postObj;
                        commentIds = commentIds.concat(post.comments)
                        if (userIdStrings.indexOf(post.userId.toString()) === -1) {
                            userIdStrings.push(post.userId.toString());
                            userIds.push(post.userId);
                        }

                        return postsObj
                    }, {});

                    return User.getUserFeedPromise(userIds)
                        .then((userFeed) => {
                            return { posts: postFeed, users: userFeed };
                        }).then((feed) => {
                            if (query.feedSummary)
                                feed.feed = feedsObj;
                            let feedObj = { data: feed };
                            if (Object.keys(pagination).length !== 0) {
                                feedObj.pagination = pagination;
                            }
                            return feedObj;
                        });
                });
        });
}

function getFeedQuery(query) {
    let feedQueryObj = getFeedQueryObject(query, 'postedOn');
    if (query.category === 'all') {
        return Promise.resolve(feedQueryObj);
    }

    return FeedCategory.findById(query.category).exec()
        .then(category => {
            if (!category) {
                feedQueryObj.categories = query.category;
                return feedQueryObj;
            }

            const categoryFilter = { $in: category.categories }
            feedQueryObj.categories = categoryFilter;
            return feedQueryObj;
        })
}

function getFeedByCategory(query, user) {
    let feedQueryObj = getFeedQueryObject(query, 'postedOn');
    const categoriesFilter = [{ categories: query.category }, { category: query.category }]
    feedQueryObj['$or'] = categoriesFilter;

    return getFeedQuery(query).then(feedQueryObj => {
        return Post.find(feedQueryObj).sort({ 'postedOn': -1 }).limit(query.limit + 1).exec()
            .then((posts) => {
                let postIds = []
                posts.forEach((post) => {
                    postIds.push(post.id)
                });
                let pagination = getFeedPagination(query, posts, 'postedOn', query.pagingRelativePath);
                var userIds = [];
                var userIdStrings = [];
                var commentIds = [];
                var postFeed = posts.reduce((postsObj, post) => {
                    let postObj = post.toJSON();
                    postObj.likes = getLikeData(post.likes, user);
                    let commentPage = API_BASE + 'posts/' + post.id + '/comments';
                    postObj.comments = getCommentData(post.comments, user, commentPage);
                    postsObj[post._id] = postObj;
                    commentIds = commentIds.concat(post.comments);
                    if (userIdStrings.indexOf(post.userId.toString()) === -1) {
                        userIdStrings.push(post.userId.toString());
                        userIds.push(post.userId);
                    }
                    return postsObj;
                }, {});
                return User.getUserFeedPromise(userIds)
                    .then((userFeed) => {
                        return { posts: postFeed, users: userFeed };
                    })
                    .then((feed) => {
                        feed.feed = { postIds: postIds };
                        let categoryFeed = { data: feed }
                        if (Object.keys(pagination).length !== 0) {
                            categoryFeed.pagination = pagination;
                        }
                        return categoryFeed;
                    });
            });
    });
}

function updateFeed(filter, update) {
    return Feed.updateFeed(filter, update);
}

module.exports = {
    getFeed, getFeedByCategory, updateFeed
};
