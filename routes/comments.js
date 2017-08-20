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

function fetchReplies(commentId, user, req, res) {
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
                        // console.log(comments)
                        var result = comments.reduce(function (comments, comment) {
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
                            return comments;
                        }, {});
                        res.status(200).json(result);
                    }
                });
            } else {
                res.status(404).json({ commentId: req.params.commentId, messge: 'Not Found' });
            }
        }
    });
}

// GET the comments for a top level comments (by its id)
router.get('/:commentId/comments',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (user === false) {
                fetchReplies(req.params.commentId, null, req, res)
            } else {
                fetchReplies(req.params.commentId, user, req, res)
            }
        })(req, res, next);
    });

router.get("/:commentId/comments_x", function (req, res) {
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