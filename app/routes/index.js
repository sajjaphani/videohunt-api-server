const router = require('express').Router();

router.get("/", function (req, res) {
    res.json({ message: 'Hello from VoideoHunt!' });
});

const users = require('./users');
router.use("/api/v1/users", users);

const posts = require('./posts');
router.use("/api/v1/posts", posts);

const comments = require('./comments');
router.use("/api/v1/comments", comments);

const category = require('./category');
router.use("/api/v1/category", category);

module.exports = router;