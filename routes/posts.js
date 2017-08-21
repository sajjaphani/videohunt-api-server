const router = require('express').Router()
const { parseFeedQuery } = require('./query-parser')
const passport = require('passport')
// TODO we need to change this as we are supposed to use OAuth 2.0?
// TODO We need to omit __v before sending the resutls
// TODO can we extract the db access logic separately?
function getFeedData(queryParams, user, req, res) {
    let models = req.app.get('models')
    models.Feed.findFeeds(queryParams, function (err, feeds) {
        if (err)
            res.send(err)
        else {
            let postIds = []
            let feedsObj = {}
            feeds.data.forEach(function (feed) {
                feedsObj[feed.date.toISOString()] = feed.posts
                postIds = postIds.concat(feed.posts)
            });

            models.Post.findPosts(postIds, function (err, posts) {
                if (err)
                    res.send(err)
                else {
                    var users = []
                    var userids = []
                    var commentIds = []
                    var postFeed = posts.reduce(function (postsObj, post) {
                        let postObj = post.toJSON()
                        let likes = postObj.likes
                        let canLike = user ? true : false
                        let uid = user ? user.id : ''
                        let hasLiked = post.likes.indexOf(uid) > -1 ? true : false
                        postObj.likes = { data: likes, summary: { count: likes.length, can_like: canLike, has_liked: hasLiked } }

                        let comments = postObj.comments
                        let canComment = user ? true : false
                        postObj.comments = { data: comments, summary: { count: comments.length, can_comment: canComment } }
                        postsObj[post._id] = postObj
                        commentIds = commentIds.concat(post.comments)
                        if (userids.indexOf(post.userId.toString()) === -1) {
                            userids.push(post.userId.toString())
                            users.push(post.userId)
                        }
                        return postsObj
                    }, {});
                    let commentsFeed = {}
                    models.Comment.find({
                        _id: {
                            $in: commentIds
                        }
                    }, function (err, comments) {
                        if (err) {
                            console.error(err)
                            res.send(err)
                        } else {
                            // console.log(comments)
                            commentsFeed = comments.reduce(function (comments, comment) {
                                let commentObj = comment.toJSON()
                                let likes = commentObj.likes
                                let canLike = user ? true : false
                                let uid = user ? user.id : ''
                                let hasLiked = comment.likes.indexOf(uid) > -1 ? true : false
                                commentObj.likes = { data: likes, summary: { count: likes.length, can_like: canLike, has_liked: hasLiked } }

                                let commentsObj = commentObj.comments
                                delete commentObj.comments
                                let canComment = user ? true : false
                                commentObj.replies = { data: commentsObj, summary: { count: commentsObj.length, can_comment: canComment } }

                                comments[comment._id] = commentObj
                                if (userids.indexOf(comment.userId.toString()) === -1) {
                                    userids.push(comment.userId.toString())
                                    users.push(comment.userId)
                                }
                                return comments;
                            }, {});
                            models.User.findUsers(users, function (err, users) {
                                if (err) {
                                    console.error(err)
                                    res.send(err)
                                } else {
                                    var userFeed = users.reduce(function (users, user) {
                                        users[user._id] = user
                                        return users
                                    }, {});

                                    let feedResponse = { data: { 'feed': feedsObj, 'posts': postFeed, 'users': userFeed, 'comments': commentsFeed } }
                                    if (feeds.pagination)
                                        feedResponse.pagination = feeds.pagination
                                    // console.log(feedResponse)
                                    res.setHeader('Access-Control-Allow-Origin', '*');
                                    res.json(feedResponse);
                                }
                            });
                        }
                    });
                }
            })
        }
    })
}

router.get('/',
    (req, res, next) => {
        let dbParams = parseFeedQuery(req.query, 3)
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (user === false) {
                getFeedData(dbParams, null, req, res)
            } else {
                // User loggedin so send feed/comments with user context
                getFeedData(dbParams, user, req, res)
                //res.json({ msg: 'User logged in', user: user })
            }
        })(req, res, next);
    });

function getPost(postId, user, req, res) {
    let models = req.app.get('models')
    models.Post.findPostById(postId, function (err, post) {
        if (err) {
            res.send(err)
        } else {
            if (post) {
                console.log(post)
                var users = []
                var userids = []
                var commentIds = []
                let postObj = post.toJSON()
                let likes = postObj.likes
                let canLike = user ? true : false
                let uid = user ? user.id : ''
                let hasLiked = post.likes.indexOf(uid) > -1 ? true : false
                postObj.likes = { data: likes, summary: { count: likes.length, can_like: canLike, has_liked: hasLiked } }
                let postFeed = {}
                postFeed[postObj.id] = postObj
                let comments = postObj.comments
                let canComment = user ? true : false
                postObj.comments = { data: comments, summary: { count: comments.length, can_comment: canComment } }
                userids.push(post.userId.toString())
                users.push(post.userId)

                let commentsFeed = {}
                models.Comment.find({
                    _id: {
                        $in: comments
                    }
                }, function (err, comments) {
                    if (err) {
                        console.error(err)
                        res.send(err)
                    } else {
                        // console.log(comments)
                        commentsFeed = comments.reduce(function (comments, comment) {
                            let commentObj = comment.toJSON()
                            let likes = commentObj.likes
                            let canLike = user ? true : false
                            let uid = user ? user.id : ''
                            let hasLiked = comment.likes.indexOf(uid) > -1 ? true : false
                            commentObj.likes = { data: likes, summary: { count: likes.length, can_like: canLike, has_liked: hasLiked } }

                            let commentsObj = commentObj.comments
                            delete commentObj.comments
                            let canComment = user ? true : false
                            commentObj.replies = { data: commentsObj, summary: { count: commentsObj.length, can_comment: canComment } }

                            comments[comment._id] = commentObj
                            if (userids.indexOf(comment.userId.toString()) === -1) {
                                userids.push(comment.userId.toString())
                                users.push(comment.userId)
                            }
                            return comments;
                        }, {});
                        models.User.findUsers(users, function (err, users) {
                            if (err) {
                                console.error(err)
                                res.send(err)
                            } else {
                                var userFeed = users.reduce(function (users, user) {
                                    users[user._id] = user
                                    return users
                                }, {});

                                let feedResponse = { data: {'posts': postFeed, 'users': userFeed, 'comments': commentsFeed } }
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.json(feedResponse);
                            }
                        });
                    }
                });
                // res.status(200).json({ post: postObj });
            } else {
                res.status(404).json({ postId: req.params.postI, messge: 'Not Found' });
            }
        }
    })
}

// GET the details of post (by its id)
// This will further accepts query parameters such as related/recommendations etc
router.get('/:postId',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (user === false) {
                getPost(req.params.postId, null, req, res)
            } else {
                getPost(req.params.postId, user, req, res)
            }
        })(req, res, next);
    });

// POST a new video
router.post('/',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                let postData = req.body
                console.log(postData)
                let models = req.app.get('models')
                let newPost = {
                    title: postData.title,
                    subtitle: postData.subtitle,
                    url: postData.url,
                    userId: user.id,
                }
                // res.status(201).json(newPost);
                new models.Post(newPost).save(function (err, post) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        let date = new Date(post.postedOn.getTime());
                        // We want date part only (set to its midnight)
                        date.setHours(12, 0, 0, 0);
                        console.log(date)
                        var query = { date: date },
                            update = { $push: { posts: post._id } },
                            options = { upsert: true, new: true };
                        // Find the document
                        models.Feed.findOneAndUpdate(query, update, options, function (err, commentsFeed) {
                            if (err) {
                                console.log(err)
                                res.send(err)
                            } else {
                                res.status(201).json({ feedKey: date, post: post });
                            }
                        });
                    }
                });
            }
        })(req, res, next);
    });

// GET the comments for the post (by its id)
router.get("/:postId/comments", function (req, res) {
    let dbParams = parseQuery(req.query, 5)
    console.log(dbParams)
    // This queries comments for a single level only, we need to query 2 levels as it is our plan to proceed
    console.log('Comments for: ' + req.params.postId)
    let models = req.app.get('models');

    models.Post.findPostById(req.params.postId, function (err, post) {
        if (err) {
            res.send(err)
        } else {
            if (post) {
                console.log(post)
            } else {
                res.status(404).json({ postId: req.params.postI, messge: 'Not Found' });
            }
        }
    })

    models.Post.findById(req.params.postId, function (err, post) {
        if (err) {
            console.log(err) // send the error to the user
            res.send(err)
        } else {
            if (post) {
                console.log(post)
                let comments = post.comments
                models.Comment.find({
                    _id: {
                        $in: comments
                    }
                }, function (err, comments) {
                    if (err) {
                        console.error(err)
                        res.send(err)
                    } else {
                        console.log(comments)
                        var commentsFeed = comments.reduce(function (comments, comment) {
                            comments[comment._id] = comment
                            return comments;
                        }, {});
                        res.status(200).json(commentsFeed);
                    }
                });
            } else {
                res.status(404).json({ messge: 'Not Found' });
            }
        }
    });
});

// POST a new comment on an existing post (by its id)
router.post('/:postId/comments',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                // User loggedin so send feed/comments with user context
                console.log('User logged in');
                console.log(req.body)
                let models = req.app.get('models');
                models.Post.findById(req.params.postId, function (err, post) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        if (post) {
                            let newComment = {
                                content: req.body.content,
                                userId: user.id
                            }
                            new models.Comment(newComment).save(function (err, comment) {
                                if (err) {
                                    console.log(err) // send the error to the user
                                    res.send(err)
                                } else {
                                    console.log(comment)
                                    models.Post.findByIdAndUpdate(post._id,
                                        { $push: { comments: comment._id } },
                                        { safe: true, upsert: true, new: true },
                                        function (err, model) {
                                            if (err) {
                                                // We should rollback comment here
                                                console.log(err)
                                                res.send(err)
                                            } else {
                                                newComment.commentId = comment._id
                                                newComment.postId = post._id
                                                newComment.commentedOn = comment.commentedOn
                                                newComment.likes = {
                                                    data: [],
                                                    summary: {
                                                        count: 0,
                                                        can_like: true,
                                                        has_liked: true
                                                    }
                                                }
                                                newComment.replies = {
                                                    data: [],
                                                    summary: {
                                                        count: 0,
                                                        can_comment: true
                                                    }
                                                }
                                                res.status(201).json(newComment)
                                            }
                                        }
                                    );
                                }
                            });
                        } else {
                            res.status(404).json({ postId: req.params.postId, messge: 'Not Found' });
                        }
                    }
                });
            }
        })(req, res, next);
    });

// POST Handle likes (like/unlike) for existing post (by its id)
router.post('/:postId/like',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                // User loggedin 
                let likeData = req.body
                let models = req.app.get('models');
                if (likeData.liked) {
                    models.Post.findByIdAndUpdate(req.params.postId,
                        { $addToSet: { likes: user.id } },
                        { safe: true, new: true }, function (err, post) {
                            if (err) {
                                return next(err);
                            }
                            res.status(200).json({ liked: likeData.liked, userId: user.id, postId: post._id })
                        });
                } else {
                    models.Post.findByIdAndUpdate(req.params.postId,
                        { $pull: { likes: user.id } },
                        { safe: true, new: true }, function (err, post) {
                            if (err) {
                                return next(err);
                            }
                            res.status(200).json({ liked: likeData.liked, userId: user.id, postId: post._id })
                        });
                }
            }
        })(req, res, next);
    });

module.exports = router;