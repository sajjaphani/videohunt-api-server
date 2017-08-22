const router = require('express').Router()

router.get("/", function (req, res) {
    res.status(200).json({ categories: ['None'] })
});

router.get("/:category", function (req, res) {
    let language = req.query.language || 'none'
    // Validate category, invalid send 404
    // Invalid language send empty result
    res.header("Access-Control-Allow-Origin", "*")
    res.status(200).json({ category: req.params.category, language:language })
});

module.exports = router