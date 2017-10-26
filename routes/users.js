const router = require('express').Router();

router.get("/", function (req, res) {
    // We should rather return an error here
    res.status(200).json({ users: ['None'] });
});

router.get("/:userId", function (req, res) {
    // req.query.paramname -> query parameter access
    // Basic profile of the user
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ user: req.params.userId });
});

router.get("/:userId/posts", function (req, res) {
    // Posts by this user
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ user: req.params.userId });
});

module.exports = router;