const router = require('express').Router();
const passport = require('passport');

const categories = require('../util/categories').getCaterogies();
const languages = require('../util/languages').getLanguages();

const { getFeedByCategory } = require('../services/feed.service');
const { parseCategoryQuery } = require('./query-parser');
const { API_BASE } = require('./constants');

router.get("/", (req, res) => {
    res.status(200).json({ categories: ['None'] });
});

// Category based feed end point
// TODO, invalid category/language error or empty result?
router.get('/:category',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err)
                return next(err);

            if (categories[req.params.category] === undefined)
                return res.status(422).json({ category: req.params.category, message: 'Invalid Category' });

            let language = req.query.language || 'all'
            if (language != 'all' && languages.indexOf(req.query.language) == -1)
                return res.status(422).json({ category: req.query.language, message: 'Invalid Language' });

            let queryParams = parseCategoryQuery(req.query, 10);
            queryParams.category = req.params.category;
            // Category Posts feed can have pagination
            queryParams.pagingRelativePath = API_BASE + 'category/' + req.params.category;
            getFeedByCategory(queryParams, user)
                .then((feed) => {
                    res.status(200).json(feed)
                }).catch((err) => {
                    res.json({ status: 'error', data: err });
                });
        })(req, res, next);
    });

module.exports = router