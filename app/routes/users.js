const router = require('express').Router();
const passport = require('passport');

const { SESSION_COOKIE_NAME } = require('../util/misc');

router.get("/", (req, res) => {
    // We should rather return an error here
    res.status(200).json({ users: ['None'] });
});

router.get('/session',
    (req, res, next) => {
        passport.authenticate(['jwt'], { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            res.status(200).json({ status: 'ok', data: user });
        })(req, res, next);
    });

router.delete("/logout", (req, res) => {
    req.logout();
    res.clearCookie(SESSION_COOKIE_NAME);
    res.status(200).json({ status: 'ok', data: { message: 'User logged out.' } });
});

router.get("/:userId", (req, res) => {
    // req.query.paramname -> query parameter access
    // Basic profile of the user
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ user: req.params.userId });
});

router.get("/:userId/posts", (req, res) => {
    // Posts by this user
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ user: req.params.userId });
});

module.exports = router;