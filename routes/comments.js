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
            models.Comment.getRepliesPromise(req.params.commentId, user, models).then(function (commentFeed) {
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
                // console.log(commentData)
                models.Comment.addReplyPromise(req.params.commentId, commentData.content, user, models).then(function (response) {
                    res.status(201).json(response)
                }).then(undefined, function (err) {
                    res.send(err)
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