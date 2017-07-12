const router = require('express').Router();

// GET all (most frequent) posts
// Currently we are fetching all (we should introduce pagination)
router.get("/", function (req, res) {
    let models = req.app.get('models')
    models.Post.find({}, function (err, posts) {
        if (err) {
            console.error(err)
        } else {
            let feed = { 'feed': {}, 'posts': {} }

            var result = posts.reduce(function (feed, post) {
                let map = feed['feed']
                let posts = feed['posts']
                posts[post._id] = post

                let key = new Date(post.postedOn).toDateString()
                options = map[key] || []
                options.push(post._id);
                map[key] = options

                return feed;
            }, feed);
            res.status(200).json(feed);
        }
    }).sort({ 'postedOn': -1 });
});

// GET the details of post (by its id)
// This will further accepts query parameters such as related/recommendations etc
router.get("/:postId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

// POST a new video
router.post('/', function (req, res) {
    let postData = req.body
    let models = req.app.get('models');
    // We are trying to find the one by email, can we get the same from the client?
    models.User.findOne({ email: postData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                let newPost = {
                    title: postData.title,
                    subtitle: postData.subtitle,
                    url: postData.url,
                    userId: user._id
                }
                console.log(newPost)
                new models.Post(newPost).save(function (err, post) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        newPost._id = post._id;
                        console.log(newPost)
                        res.status(201).json(newPost);
                    }
                });
            } else {
                // Send validation error to user
            }
        }
    });

    // Location Header
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30
    // Come to here means there should be some error
    // res.send('Something went wront... try again later')
});

// GET the comments for the post (by its id)
router.get("/:postId/comments", function (req, res) {
    console.log('Comments for: ' + req.params.postId)
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

// POST a new comment on an existing post (by its id)
router.post("/:postId/comments", function (req, res) {
    // res.status(201).json({ post: req.params.postId });
    console.log('Posting a new comment for: ' + req.params.postId)
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

module.exports = router;