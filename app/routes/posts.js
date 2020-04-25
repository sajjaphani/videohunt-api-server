const router = require('express').Router();
const passport = require('passport');

const { getFeed } = require('../services/feed.service');
const { checkNewPost, saveNewPost, getPosts, updateLike, addComment, getComments, searchPosts } = require('../services/post.service');
const { findRecommendations } = require('../services/recommendations.service');
const { getFeedPostsQueryObject, getPostCommentsQueryObject } = require('./query-parser');
const { SESSION_ERROR } = require('./constants');

router.get('/',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            const _user = {};
            if (user) {
                _user.id = user.id;
                _user.name = user.name;
                _user.picture = user.picture;
            }

            const query = getFeedPostsQueryObject(req.query);
            getFeed(query, user)
                .then(feed => {
                    feed.data.currentUser = _user;
                    res.status(200).json(feed);
                }).catch(err => {
                    res.json({ status: 'error', error: err });
                });
        })(req, res, next);
    });

router.get('/search',
    (req, res, next) => {
        const query = req.query;
        const queryStr = query.q || '';
        // Posts feed can have pagination
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            searchPosts(queryStr, user)
                .then((posts) => {
                    res.status(200).json({ status: 'ok', data: posts });
                }).catch(err => {
                    console.log(err);
                    res.json({ status: 'error', error: err });
                });
        })(req, res, next);
    });

// GET the details of post (by its id)
router.get('/:postId',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            getPosts(req.params.postId, null, user)
                .then((feed) => {
                    res.status(200).json({ data: feed });
                }).catch((err) => {
                    res.json({ status: 'error', error: err });
                });
        })(req, res, next);
    });

router.get('/:postId/recommendations',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            findRecommendations(req.params.postId, user)
                .then((data) => {
                    res.status(200).json({ status: 'ok', data: data });
                }).catch((err) => {
                    res.json({ status: 'error', error: err });
                });
        })(req, res, next);
    });

// POST a new video
router.post('/status',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (user === false) {
                res.status(401).json(SESSION_ERROR);
            } else {
                let postData = req.body;
                checkNewPost(postData.url, user)
                    .then((data) => {
                        res.status(200).json(data);
                    }).catch((err) => {
                        console.log(err)
                        const _data = { error: err.error, message: err.message };
                        res.json({ status: 'error', error: _data });
                    });
            }
        })(req, res, next);
    });

router.post('/',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (user === false) {
                res.status(401).json(SESSION_ERROR);
            } else {
                let postData = req.body
                saveNewPost(postData, user)
                    .then((data) => {
                        res.status(200).json(data);
                    }).catch((err) => {
                        res.json({ status: 'error', error: err });
                    });
            }
        })(req, res, next);
    });

// GET the comments for the post (by its id)
// Not in use for now
router.get('/:postId/comments',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            const query = getPostCommentsQueryObject(req.query);
            getComments(req.params.postId, query, user)
                .then((response) => {
                    res.status(200).json(response);
                }).catch((err) => {
                    res.json({ status: 'error', error: err });
                });
        })(req, res, next);
    });

// POST a new comment on an existing post (by its id)
router.post('/:postId/comments',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (user === false) {
                res.status(401).json(SESSION_ERROR);
            } else {
                addComment(req.params.postId, req.body.content, user)
                    .then((response) => {
                        res.status(201).json(response);
                    }).catch((err) => {
                        res.json({ status: 'error', error: err });
                    });
            }
        })(req, res, next);
    });

// POST Handle likes (like/unlike) for existing post (by its id)
router.post('/:postId/like',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (user === false) {
                res.status(401).json(SESSION_ERROR);
            } else {
                let likeData = req.body
                updateLike(req.params.postId, user.id, likeData.liked)
                    .then((updatedStatus) => {
                        res.status(200).json(updatedStatus);
                    }).catch((err) => {
                        res.json({ status: 'error', error: err });
                    });
            }
        })(req, res, next);
    });

module.exports = router;