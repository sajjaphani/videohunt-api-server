const router = require('express').Router();
const passport = require('passport');

const { getFeedForTopic } = require('../services/feed.service');
const { getTopicPostsQueryObject } = require('./query-parser');

router.get("/", (req, res) => {
    res.status(200).json({ categories: ['None'] });
});

// Category based feed end point
// TODO, invalid category/language error or empty result?
router.get('/:category',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            const query = getTopicPostsQueryObject(req.query);
            query.category = req.params.category;
            getFeedForTopic(query, user)
                .then((feed) => {
                    res.status(200).json(feed);
                }).catch((err) => {
                    res.json({ status: 'error', error: err });
                });
        })(req, res, next);
    });

module.exports = router;
