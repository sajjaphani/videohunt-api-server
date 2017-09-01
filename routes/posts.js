const router = require('express').Router()
const { parseFeedQuery, parseQuery } = require('./query-parser')
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
                models.Post.addPostPromise(postData, user, models).then(function(response){
                    res.status(200).json(response)
                }).then(undefined, function (err) {
                    res.send(err)
                })
            }
        })(req, res, next);
    });

// GET the comments for the post (by its id)
// Not in use for now
router.get('/:postId/comments',
(req, res, next) => {
    let dbParams = parseQuery(req.query, 5)
    passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
        if (err)
            return next(err);
        let models = req.app.get('models');
        models.Post.getCommentsPromise(req.params.postId, dbParams, user, models).then(function (response) {
            res.status(200).json(response)
        }).then(undefined, function (err) {
            res.send(err)
        });
    })(req, res, next);
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