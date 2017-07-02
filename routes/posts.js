const router = require('express').Router();

router.get("/", function (req, res) {
    res.status(200).json({ posts: ['None'] });;
});

router.get("/:postId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

module.exports = router;