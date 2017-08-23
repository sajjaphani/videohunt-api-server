const router = require('express').Router()
const categories = require('../util/categories').getCaterogies()
const languages = require('../util/languages').getLanguages()

const { parseCategoryQuery } = require('./query-parser')

router.get("/", function (req, res) {
    res.status(200).json({ categories: ['None'] })
});

router.get("/:category", function (req, res) {
    let queryParams = parseCategoryQuery(req.query, 25)
    console.log(queryParams)
    if(categories.indexOf(req.params.category) == -1) {
        return res.status(422).json({ category: req.params.category, message: 'Invalid Category' })
    }

    let language = req.query.language || 'all'
    if(language != 'all' && languages.indexOf(req.query.language) == -1) {
        return res.status(422).json({ category: req.query.language, message: 'Invalid Language' })
    }
    console.log(categories)
    console.log(languages)

    // Validate category, invalid send 404
    // Invalid language send empty result
    res.header("Access-Control-Allow-Origin", "*")
    res.status(200).json({ category: req.params.category, language:language })
});

module.exports = router