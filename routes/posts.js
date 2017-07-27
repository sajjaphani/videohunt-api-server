const router = require('express').Router()
const {parseFeedQuery} = require('./query-parser')
// TODO we need to change this as we are supposed to use OAuth 2.0?
// TODO We need to omit __v before sending the resutls
// TODO can we extract the db access logic separately?

router.get("/", function (req, res) {
    // Get the logged in user here
    // console.log(typeof req.query.since)
    // console.log(parseInt(req.query.since))
    let dbParams = parseFeedQuery(req.query, 3)
    console.log(dbParams)
    let models = req.app.get('models')
    models.Feed.findFeeds(dbParams, function (err, feeds) {
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
                    let user = { id: '' }
                    var users = []
                    var userids = []
                    var postFeed = posts.reduce(function (postsObj, post) {
                        if (post.likes.indexOf(user.id))
                            post.liked = true
                        else
                            post.liked = false
                        post.likeCount = post.likes.length
                        postsObj[post._id] = post
                        if (userids.indexOf(post.userId.toString()) === -1) {
                            userids.push(post.userId.toString())
                            users.push(post.userId)
                        }
                        return postsObj
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

                            let feedResponse = {data:{ 'feed': feedsObj, 'posts': postFeed, 'users': userFeed }}
                            if(feeds.pagination)
                                feedResponse.pagination = feeds.pagination

                            res.json(feedResponse);
                        }
                    });
                }
            })
        }
    })
});

// GET the details of post (by its id)
// This will further accepts query parameters such as related/recommendations etc
router.get("/:postId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

// POST a new video
router.post('/', function (req, res) {
    let postData = req.body
    let models = req.app.get('models')
    // We are trying to find the one by email, can we get the same from the client?
    models.User.findOne({ email: postData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                // TODO remove date
                // let dt = new Date(Date.parse(postData.postedOn));
                let newPost = {
                    title: postData.title,
                    subtitle: postData.subtitle,
                    url: postData.url,
                    userId: user._id,
                    postedOn: postData.postedOn
                }
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
                        models.Feed.findOneAndUpdate(query, update, options, function (err, result) {
                            if (err) {
                                console.log(err)
                                res.send(err)
                            } else {
                                res.status(201).json(post);
                            }
                        });
                    }
                });
            } else {
                // Send validation error to user
            }
        }
    });

    // Location Header
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30
    // Come to here means there should be some error
    // res.send('Something went wront... try again later')
});

// GET the comments for the post (by its id)
router.get("/:postId/comments", function (req, res) {
    // This queries comments for a single level only, we need to query 2 levels as it is our plan to proceed
    console.log('Comments for: ' + req.params.postId)
    let models = req.app.get('models');
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
                        var result = comments.reduce(function (comments, comment) {
                            comments[comment._id] = comment
                            return comments;
                        }, {});
                        res.status(200).json(result);
                    }
                });
            } else {
                res.status(404).json({ messge: 'Not Found' });
            }
        }
    });
});

// POST a new comment on an existing post (by its id)
router.post("/:postId/comments", function (req, res) {
    let commentData = req.body
    let models = req.app.get('models');
    models.User.findOne({ email: commentData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                models.Post.findById(req.params.postId, function (err, post) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        if (post) {
                            let newComment = {
                                content: commentData.content,
                                userId: user._id
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
                                                res.status(201).json(newComment)
                                            }
                                        }
                                    );
                                }
                            });
                        } else {
                            res.status(404).json({ messge: 'Not Found' });
                        }
                    }
                });
            } else {
                res.status(401).json({ message: 'Unauthorized' });
            }
        }
    });
});

// POST Handle likes (like/unlike) for existing post (by its id)
router.post("/:postId/like", function (req, res) {
    let likeData = req.body
    let models = req.app.get('models');
    models.User.findOne({ email: likeData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                if (likeData.liked) {
                    models.Post.findByIdAndUpdate(req.params.postId,
                        { $addToSet: { likes: user._id } },
                        { safe: true, new: true }, function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("RESULT: " + result);
                            res.status(200).json({ liked: likeData.liked, userId: user._id, postId: result._id })
                        });
                } else {
                    console.log('here... ' + user._id)
                    models.Post.findByIdAndUpdate(req.params.postId,
                        { $pull: { likes: user._id } },
                        { safe: true, new: true }, function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("RESULT: " + result);
                            res.status(200).json({ liked: likeData.liked, userId: user._id, postId: result._id })
                        });
                }
            } else {
                res.status(401).json({ message: 'Unauthorized' });
            }
        }
    });
});

module.exports = router;