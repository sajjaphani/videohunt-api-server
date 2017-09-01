const router = require('express').Router()
const { parseFeedQuery } = require('./query-parser')
const passport = require('passport')
// TODO We need to omit __v before sending the resutls
// TODO can we extract the db access logic separately?

router.get('/',
    (req, res, next) => {
        let dbParams = parseFeedQuery(req.query, 3)
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            let models = req.app.get('models')
            models.Feed.getFeedsPromise(dbParams, user, models).then(function (feed) {
                res.status(200).json(feed);
            }).then(undefined, function (err) {
                res.send(err)
            });
        })(req, res, next);
    });

// GET the details of post (by its id)
// This will further accepts query parameters such as related/recommendations etc
router.get('/:postId',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            let models = req.app.get('models')
            models.Post.getPostsPromise(req.params.postId, user, models).then(function (feed) {
                res.status(200).json({ data: feed });
            }).then(undefined, function (err) {
                res.send(err)
            });
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
                // console.log(postData)
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
                        // console.log(date)
                        var query = { date: date },
                            update = { $push: { posts: post._id } },
                            options = { upsert: true, new: true };
                        // Find the document
                        models.Feed.findOneAndUpdate(query, update, options, function (err, commentsFeed) {
                            if (err) {
                                console.log(err)
                                res.send(err)
                            } else {
                                // Add the necessary summary to comments and likes
                                let postObj = post.toJSON()
                                postObj.likes = { data: [], summary: { count: 0, can_like: true, has_liked: false } }
                                postObj.comments = { data: [], summary: { count: 0, can_comment: true } }
                                res.status(201).json({ feedKey: date, post: postObj });
                            }
                        });
                    }
                });
            }
        })(req, res, next);
    });

// GET the comments for the post (by its id)
// Not in use for now
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
                let models = req.app.get('models');
                models.Post.addCommentPromise(req.params.postId, req.body.content, user, models).then(function (response) {
                    res.status(201).json(response)
                }).then(undefined, function (err) {
                    res.send(err)
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
                let models = req.app.get('models')
                let likeData = req.body
                models.Post.updateLikePromise(req.params.postId, user.id, likeData.liked).then(function(updatedStatus) {
                    res.status(200).json(updatedStatus)
                }).then(undefined, function (err) {
                    res.send(err)
                });
            }
        })(req, res, next);
    });

module.exports = router;