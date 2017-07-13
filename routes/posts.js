const router = require('express').Router();

// TODO we need to change this as we are supposed to use OAuth 2.0?
// TODO We need to omit __v before sending the resutls
// TODO can we extract the db access logic separately?
// GET all (most frequent) posts
// Currently we are fetching all (we should introduce pagination)
router.get("/", function (req, res) {
    let models = req.app.get('models')
    models.Post.find({}, function (err, posts) {
        if (err) {
            console.error(err)
            res.send(err)
        } else {
            let feed = { 'feed': {}, 'posts': {} }
            var result = posts.reduce(function (feed, post) {
                let map = feed['feed']
                let posts = feed['posts']
                posts[post._id] = post

                let key = new Date(post.postedOn).toDateString()
                options = map[key] || []
                options.push(post._id);
                map[key] = options

                return feed;
            }, feed);
            res.status(200).json(feed);
        }
    }).sort({ 'postedOn': -1 });
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
    let models = req.app.get('models');
    // We are trying to find the one by email, can we get the same from the client?
    models.User.findOne({ email: postData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                let newPost = {
                    title: postData.title,
                    subtitle: postData.subtitle,
                    url: postData.url,
                    userId: user._id
                }
                console.log(newPost)
                new models.Post(newPost).save(function (err, post) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        newPost._id = post._id;
                        console.log(newPost)
                        res.status(201).json(newPost);
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
                            res.status(200).json({liked:likeData.liked, userId:user._id, postId:result._id})
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
                            res.status(200).json({liked:likeData.liked, userId:user._id, postId:result._id})
                        });
                }
            } else {
                res.status(401).json({ message: 'Unauthorized' });
            }
        }
    });
});

module.exports = router;