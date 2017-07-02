const router = require('express').Router();

router.get("/", function (req, res) {
    console.log('Request')
    res.json({ message: 'Hello World' });
});

const users = require('./users');
router.use("/api/v1/users", users);

const posts = require('./posts');
router.use("/api/v1/posts", posts);

const comments = require('./comments');
router.use("/api/v1/comments", comments);

// TODO we need to remove below API and replace with posts API
router.get("/api/v1/videos", function (req, res) {
    var videoPosts = [{
        date: 'Today',
        annotation: 'April 30th',
        posts: [
            {
                postId: 'dsdxdxax',
                title: 'Fun Bucket | 87th Episode | Funny Videos | #TeluguComedyWebSeries ',
                subtitle: 'Fun Bucket',
                url: 'https://www.youtube.com/watch?v=pcdWG0LQYNk',
                comments: 250,
                likes: 1200,
                postedBy: 'nischal.srinivas'
            },
            {
                postId: 'dsdsdsa2',
                title: 'Annoying things Neighbors say ',
                subtitle: 'Mahathalli',
                url: 'https://www.youtube.com/watch?v=ytfxuXt4R8M',
                comments: 250,
                likes: 1200,
                postedBy: 'nischal.srinivas'
            },
            {
                postId: 'dsdsdsa3',
                title: 'Bisht Ko Mili Nemesister',
                subtitle: 'TVF\'s Bisht, Please!',
                url: 'https://www.youtube.com/watch?v=w_CuHxcNxu0',
                comments: 250,
                likes: 1200,
                postedBy: 'nischal.srinivas'
            }
        ],
        postsCount: 20
    },
    {
        date: "Yesterday",
        posts: [
            {
                postId: 'wqlwql1',
                title: 'Baahubali 2 - The Conclusion',
                subtitle: 'Official Trailer (Hindi) | S.S. Rajamouli | Prabhas | Rana Daggubati',
                url: 'https://www.youtube.com/watch?v=G62HrubdD6o',
                comments: 250,
                likes: 1200,
                postedBy: 'nischal.srinivas'
            },
            {
                postId: 'aa00',
                title: 'Bachelors vs Early Morning',
                subtitle: 'TVF Bachelors ft. BB ki Vines | E04',
                url: 'https://www.youtube.com/watch?v=n6CwOTJMCbY',
                comments: 250,
                likes: 1200,
                postedBy: 'nischal.srinivas'
            }
        ],
        postsCount: 20
    },
    {
        date: "Some date..........",
        posts: [
            {
                postId: 'wqlwql112',
                title: 'Benelli TNT 1130R : Review............',
                subtitle: 'PowerDrift',
                url: 'https://www.youtube.com/watch?v=veaQjNQqRsk',
                comments: 250,
                likes: 1200,
                postedBy: 'mounika.p'
            }
        ],
        postsCount: 20
    },
    {
        date: "Some date",
        posts: [
            {
                postId: 'wqlwql2',
                title: 'Benelli TNT 1130R : Review',
                subtitle: 'PowerDrift',
                url: 'https://www.youtube.com/watch?v=veaQjNQqRsk',
                comments: 250,
                likes: 1200,
                postedBy: 'mounika.p'
            }
        ],
        postsCount: 20
    }]

    return res.send(videoPosts);

});

// Route to query for a given post by its id
router.get('/api/video/:postId', function (req, res) {
    console.log(req.params.postId);
    var post = {
        postId: 'wqlwql1',
        title: 'Baahubali 2 - The Conclusion',
        subtitle: 'Official Trailer (Hindi) | S.S. Rajamouli | Prabhas | Rana Daggubati',
        url: 'https://www.youtube.com/watch?v=G62HrubdD6o',
        comments: 250,
        likes: 1200,
        postedBy: 'nischal.srinivas'
    };
    res.send(post)
});

module.exports = router;

