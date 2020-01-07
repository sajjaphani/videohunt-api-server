const router = require('express').Router();
const passport = require('passport');

const { getFeed } = require('../services/feed.service');
const { checkNewPost, saveNewPost, getPosts, updateLike, addComment, getComments } = require('../services/post.service');
const { parseFeedQuery, parseQuery } = require('./query-parser');
const { API_BASE } = require('./constants');

router.get('/',
    (req, res, next) => {
        let queryParams = parseFeedQuery(req.query, 3);
        // Posts feed can have pagination
        queryParams.pagingRelativePath = API_BASE + 'posts'
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }
            getFeed(queryParams, user)
                .then(feed => {
                    res.status(200).json(feed);
                }).catch(err => {
                    // console.log(err);
                    res.json({ status: 'error', data: err });
                });
        })(req, res, next);
    });

// GET the details of post (by its id)
// This will further accepts query parameters such as related/recommendations etc
router.get('/:postId',
    (req, res, next) => {
        // When we query single page, we can have pagination for comments
        // queryParams.pagingRelativePath = 'posts' + req.params.postId + '/comments'
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err)
                return next(err);
            getPosts(req.params.postId, null, user)
                .then((feed) => {
                    res.status(200).json({ data: feed });
                }).catch((err) => {
                    res.json({ status: 'error', data: err });
                });
        })(req, res, next);
    });

// POST a new video
router.post('/status',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                let postData = req.body;
                checkNewPost(postData.url, user)
                    .then((data) => {
                        res.status(200).json(data);
                    }).catch((err) => {
                        // console.log(err)
                        const _data = { error: err.error, message: err.message };
                        res.json({ status: 'error', data: _data });
                    });
            }
        })(req, res, next);
    });

router.post('/',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                let postData = req.body
                saveNewPost(postData, user)
                    .then((data) => {
                        res.status(200).json(data);
                    }).catch((err) => {
                        res.json({ status: 'error', data: err });
                    });
            }
        })(req, res, next);
    });

// GET the comments for the post (by its id)
// Not in use for now
router.get('/:postId/comments',
    (req, res, next) => {
        let queryParams = parseQuery(req.query, 5)
        // Post comments feed can have pagination
        queryParams.pagingRelativePath = API_BASE + 'posts/' + req.params.postId + '/comments'
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err)
                return next(err);
            getComments(req.params.postId, queryParams, user)
                .then((response) => {
                    res.status(200).json(response);
                }).catch((err) => {
                    res.json({ status: 'error', data: err });
                });
        })(req, res, next);
    });

// POST a new comment on an existing post (by its id)
router.post('/:postId/comments',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                addComment(req.params.postId, req.body.content, user)
                    .then((response) => {
                        res.status(201).json(response);
                    }).catch((err) => {
                        res.json({ status: 'error', data: err });
                    });
            }
        })(req, res, next);
    });

// POST Handle likes (like/unlike) for existing post (by its id)
router.post('/:postId/like',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err)
                return next(err);
            if (user === false) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                let likeData = req.body
                updateLike(req.params.postId, user.id, likeData.liked)
                    .then((updatedStatus) => {
                        res.status(200).json(updatedStatus);
                    }).catch((err) => {
                        res.json({ status: 'error', data: err });
                    });
            }
        })(req, res, next);
    });

module.exports = router;