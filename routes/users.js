const router = require('express').Router();

router.get("/", function (req, res) {
    res.status(200).json({ users: ['None'] });;
});

router.get("/:userId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ user: req.params.userId });
});

module.exports = router;