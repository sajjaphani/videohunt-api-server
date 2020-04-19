const router = require('express').Router();
const passport = require('passport');

const { getReplies, updateLike, addReply } = require('../services/comment.service');

const { parseQuery } = require('./query-parser');
const { API_BASE, SESSION_ERROR } = require('./constants');

// TODO we should be getting post id as well to validate the post also?
router.get("/", (req, res) => {
    res.status(200).json({ comments: ['None'] });
});

router.get("/:commentId", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ comment: req.params.commentId });
});

// GET the comments for a top level comments (by its id)
router.get('/:commentId/comments',
    (req, res, next) => {
        let queryParams = parseQuery(req.query, 5);
        // Comment replies feed can have pagination
        queryParams.pagingRelativePath = API_BASE + 'comments/' + req.params.commentId + '/comments'
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err)
                return next(err);
            getReplies(req.params.commentId, queryParams, user)
                .then((commentFeed) => {
                    res.status(200).json(commentFeed)
                }).catch((err) => {
                    res.json({ status: 'error', error: err });
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
                res.status(401).json(SESSION_ERROR);
            } else {
                let commentData = req.body
                addReply(req.params.commentId, commentData.content, user)
                    .then((response) => {
                        res.status(201).json(response)
                    }).catch((err) => {
                        res.json({ status: 'error', error: err });
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
                res.status(401).json(SESSION_ERROR);
            } else {
                let likeData = req.body
                updateLike(req.params.commentId, user.id, likeData.liked)
                    .then((updatedStatus) => {
                        res.status(200).json(updatedStatus)
                    }).catch((err) => {
                        res.json({ status: 'error', error: err });
                    });
            }
        })(req, res, next);
    });

module.exports = router;