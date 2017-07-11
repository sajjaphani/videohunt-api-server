const router = require('express').Router();

// GET all (most frequent) posts
router.get("/", function (req, res) {
    let models = req.app.get('models');


    // models.Post.aggregate([
    //     {
    //         $project: {
    //             dateOnly: { $dateToString: { format: "%Y-%m-%d", date: "$postedOn" } },
    //         }
    //     },
    //     { $group: { "_id": "$dateOnly", posts: { $push: "$_id" } } }
    // ], function (err, docs) {
    //     if (err) {
    //         console.log(err)
    //     } else {
    //        feed.push(docs)
    //        console.log(feed)
    //     }
    // });

    models.Post.find({}, function (err, posts) {
        if (err) {
            console.error(err);
        } else {
            // console.log(posts);
            // posts.sort({ postedOn: -1 }).forEach(function (post) {
            //     var dte = new Date(post.postedOn)
            //     console.log(dte.toDateString());
            //     var posts = feed[dte.toDateString()].posts || [];
            //     posts.push(post.postId)
            // });

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
            // res.status(200).json({ posts: posts });;
        }
    });
});

// GET the details of post by its id
router.get("/:postId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

// POST a new video
router.post('/', function (req, res) {
    // res.status(201).json({ post: req.params.postId });
    // Location Header
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30
  res.send('POSTing new video coming soon...')
});

// GET the comments for the post by its id
router.get("/:postId/comments", function (req, res) {
    console.log('Comments for: ' + req.params.postId)
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

// POST a new comment on the post by its id
router.post("/:postId/comments", function (req, res) {
        // res.status(201).json({ post: req.params.postId });
    console.log('Posting a new comment for: ' + req.params.postId)
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

module.exports = router;