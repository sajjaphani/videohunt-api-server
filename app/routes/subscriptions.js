const router = require('express').Router();

const { addSubscription } = require('../services/user.service');

router.post('/', (req, res, next) => {
    const data = req.body;
    const email = data.email;
    addSubscription(email)
        .then((data) => {
            res.status(200).json(data);
        }).catch((err) => {
            console.log(err);
            res.json({ status: 'error', error: err });
        });
});

module.exports = router;