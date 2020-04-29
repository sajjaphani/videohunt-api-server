const router = require('express').Router();

router.get("/", function (req, res) {
    res.json({ message: 'Hello from VoideoHunt!' });
});

const users = require('./users');
router.use("/api/v1/users", users);

const subscriptions = require('./subscriptions');
router.use("/api/v1/subscriptions", subscriptions);

const posts = require('./posts');
router.use("/api/v1/posts", posts);

const comments = require('./comments');
router.use("/api/v1/comments", comments);

const category = require('./category');
router.use("/api/v1/topic", category);

const topics = require('./topics');
router.use("/api/v1/topics", topics);

module.exports = router;