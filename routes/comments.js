const router = require('express').Router()
const passport = require('passport')

// TODO we should be getting post id as well to validate the post also?
router.get("/", function (req, res) {
    res.status(200).json({ comments: ['None'] });;
});

router.get("/:commentId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ comment: req.params.commentId });
});

// GET the comments for a top level comments (by its id)
router.get('/:commentId/comments',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            let models = req.app.get('models')
            models.Comment.getRepliesPromise(req.params.commentId, user, models).then(function(commentFeed){
                res.status(200).json(commentFeed)
            }).then(undefined, function (err) {
                res.send(err)
            });
        })(req, res, next);
    });

// POST a new reply on an existing comment (by its id)
router.post('/:commentId/comments',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                let models = req.app.get('models')
                let commentData = req.body
                console.log(commentData)
                models.Comment.findById(req.params.commentId, function (err, comment) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        if (comment) {
                            let newComment = {
                                content: commentData.content,
                                userId: user.id
                            }
                            new models.Comment(newComment).save(function (err, comment) {
                                if (err) {
                                    console.log(err) // send the error to the user
                                    res.send(err)
                                } else {
                                    console.log(comment)
                                    models.Comment.findByIdAndUpdate(req.params.commentId,
                                        { $push: { comments: comment._id } },
                                        { safe: true, upsert: true, new: true },
                                        function (err, model) {
                                            console.log('Model', model)
                                            if (err) {
                                                // We should rollback comment here
                                                console.log(err)
                                                res.send(err)
                                            } else {
                                                newComment.commentId = comment._id
                                                newComment.parentId = req.params.commentId
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
                                                // console.log(newComment)
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
            }
        })(req, res, next);
    });

// POST Handle likes (like/unlike) for existing second level comment (by its id)
router.post('/:commentId/like',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                let models = req.app.get('models')
                let likeData = req.body
                models.Comment.updateLikePromise(req.params.commentId, user.id, likeData.liked).then(function (updatedStatus) {
                    res.status(200).json(updatedStatus)
                }).then(undefined, function (err) {
                    res.send(err)
                });
            }
        })(req, res, next);
    });

module.exports = router;