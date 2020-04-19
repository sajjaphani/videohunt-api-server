const router = require('express').Router();
const passport = require('passport');

const { getFeedCategories, getCategories } = require('../services/category.service');

router.get('/tagging',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            getCategories()
                .then((data) => {
                    res.status(200).json({ status: 'ok', data: data });
                }).catch((err) => {
                    res.json({ status: 'error', error: err });
                });
        })(req, res, next);
    });

router.get('/feed-topics',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            getFeedCategories()
                .then((data) => {
                    res.status(200).json({ status: 'ok', data: data });
                }).catch((err) => {
                    res.json({ status: 'error', error: err });
                });
        })(req, res, next);
    });

module.exports = router;
