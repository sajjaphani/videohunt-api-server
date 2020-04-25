var mongoose = require('mongoose');

var Post = mongoose.model('Post');
var User = mongoose.model('User');
var FeedCategory = mongoose.model('FeedCategory');

const { getFeedPostsPaging, getTopicPostsPaging } = require('../models/helpers/PaginationHelper')
const { getLikeData, getCommentData } = require('../models/helpers/ModelHelper')
const { API_BASE } = require('../routes/constants');

// Homepage Feed
function getFeed(query, user) {
    return Post.findFeedPosts(query)
        .then((posts) => {
            let postIds = []
            posts.forEach((post) => {
                postIds.push(post.id)
            });
            let pagination = getFeedPostsPaging(query, posts.length);
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
                    if (query.feedSummary) {
                        feed.feed = { postIds: postIds };
                    }

                    let feedObj = { data: feed };
                    if (Object.keys(pagination).length !== 0) {
                        feedObj.pagination = pagination;
                    }
                    return feedObj;
                });
        }).catch(err => console.log(err));
}

function getFeedQuery(query) {
    let feedQueryObj = {};
    return FeedCategory.findById(query.category).exec()
        .then(category => {
            if (!category) {
                feedQueryObj.categories = query.category;
                return feedQueryObj;
            }

            const categoryFilter = { $in: category.categories }
            feedQueryObj.categories = categoryFilter;
            return feedQueryObj;
        });
}

// Feed for the topic
function getFeedForTopic(query, user) {
    return getFeedQuery(query).then(feedQueryObj => {
        query.filter = feedQueryObj;
        console.log('query', query)
        console.log(feedQueryObj);
        return Post.findPostsForTopic(query)
            .then((posts) => {
                let postIds = []
                posts.forEach((post) => {
                    postIds.push(post.id)
                });
                let pagination = getTopicPostsPaging(query, posts.length);
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


module.exports = {
    getFeed, getFeedForTopic
};
