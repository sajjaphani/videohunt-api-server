const router = require('express').Router()
const passport = require('passport')

const categories = require('../util/categories').getCaterogies()
const languages = require('../util/languages').getLanguages()

const { parseCategoryQuery } = require('./query-parser')

router.get("/", function (req, res) {
    res.status(200).json({ categories: ['None'] })
});

// Category based feed end point
// TODO, invalid category/language error or empty result?
router.get('/:category',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
            if (err)
                return next(err);
            if (categories.indexOf(req.params.category) == -1)
                return res.status(422).json({ category: req.params.category, message: 'Invalid Category' })

            let language = req.query.language || 'all'
            if (language != 'all' && languages.indexOf(req.query.language) == -1)
                return res.status(422).json({ category: req.query.language, message: 'Invalid Language' })

            let queryParams = parseCategoryQuery(req.query, 25)
            queryParams.category = req.params.category
            let models = req.app.get('models')
            models.Feed.getCategoryFeedPromise(queryParams, user, models).then(function (feed) {
                res.status(200).json(feed)
            }).then(undefined, function (err) {
                res.send(err)
            });
        })(req, res, next);
    });

module.exports = router