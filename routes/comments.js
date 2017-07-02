const router = require('express').Router();

router.get("/", function (req, res) {
    res.status(200).json({ comments: ['None'] });;
});

router.get("/:commentId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ comment: req.params.commentId });
});

module.exports = router;