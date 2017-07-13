const router = require('express').Router();

router.get("/", function (req, res) {
    res.json({ message: 'Hello World' });
});

const users = require('./users');
router.use("/api/v1/users", users);

const posts = require('./posts');
router.use("/api/v1/posts", posts);

const comments = require('./comments');
router.use("/api/v1/comments", comments);

module.exports = router;
