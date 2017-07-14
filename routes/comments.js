const router = require('express').Router();

// TODO we should be getting post id as well to validate the post also?
router.get("/", function (req, res) {
    res.status(200).json({ comments: ['None'] });;
});

router.get("/:commentId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ comment: req.params.commentId });
});

// GET the comments for a top level comments (by its id)
router.get("/:commentId/comments", function (req, res) {
    console.log('Comments for: ' + req.params.commentId)
    let models = req.app.get('models');
    models.Comment.findById(req.params.commentId, function (err, comment) {
        if (err) {
            console.log(err) // send the error to the user
            res.send(err)
        } else {
            if (comment) {
                console.log(comment)
                let comments = comment.comments
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

// POST a new comment on an existing comment (by its id)
router.post("/:commentId/comments", function (req, res) {
    let commentData = req.body
    let models = req.app.get('models');
    models.User.findOne({ email: commentData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                models.Comment.findById(req.params.commentId, function (err, comment) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        if (comment) {
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
                                    models.Comment.findByIdAndUpdate(req.params.commentId,
                                        { $push: { comments: comment._id } },
                                        { safe: true, upsert: true, new: true },
                                        function (err, model) {
                                            if (err) {
                                                // We should rollback comment here
                                                console.log(err)
                                                res.send(err)
                                            } else {
                                                newComment.commentId = comment._id
                                                newComment.topCommentId = req.params.commentId
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

// POST Handle likes (like/unlike) for existing second level comment (by its id)
router.post("/:commentId/like", function (req, res) {
    let likeData = req.body
    let models = req.app.get('models');
    models.User.findOne({ email: likeData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                if (likeData.liked) {
                    models.Comment.findByIdAndUpdate(req.params.commentId,
                        { $addToSet: { likes: user._id } },
                        { safe: true, new: true }, function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("RESULT: " + result);
                            res.status(200).json({ liked: likeData.liked, userId: user._id, commentId: result._id, topCommentId: req.params.commentId })
                        });
                } else {
                    console.log('here... ' + user._id)
                    models.Comment.findByIdAndUpdate(req.params.commentId,
                        { $pull: { likes: user._id } },
                        { safe: true, new: true }, function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("RESULT: " + result);
                            res.status(200).json({ liked: likeData.liked, userId: user._id, commentId: result._id, topCommentId: req.params.commentId })
                        });
                }
            } else {
                res.status(401).json({ message: 'Unauthorized' });
            }
        }
    });
});

module.exports = router;